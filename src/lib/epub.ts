/**
 * Module to create an epub instance based on the deflated folder content with the same name.
 * Used by the auxiliary scripts to generate the EPUB files for the tests.
 * 
 * @packageDocumentation
 */


import { promises as fs } from 'fs';
import * as path          from "path";
import * as JSZip         from 'jszip';
import { Constants }      from './types';

/** 
 * These files should be ignored when reading the content of the EPUB testing directory 
 * 
 * - `mimetype`: must be put into the EPUB file explicitly at first and non-compressed
 * - `.DS_Store`: a MacOS artefact that should be ignored altogether
 */
const ignoredFiles: string[] = ['.DS_Store', 'mimetype'];


/**
 * Recursive walk through a directory. The return value is the list of the full paths of the files,
 * suitable for a file read.
 * 
 * (The only reason this function is defined as 'export' is because it may be useful at some later point for
 * other purposes...)
 * 
 * @param dir name of a directory
 * @param filter filter to remove unwanted file names from the result
 */
export async function recursiveWalk(dir: string, filter?: (f:string) => boolean): Promise<string[]> {
    try {
        const content: string[] = await fs.readdir(dir);
        const retval: string[] = [];
        const dir_content: Promise<string[]>[] = [];

        for (const fname of content) {
            const file = path.resolve(dir,fname);
            const stat = await fs.stat(file);
            if (stat && stat.isDirectory()) {
                dir_content.push(recursiveWalk(file, filter));
            } else {
                if (typeof filter === 'undefined' || (filter && filter(file))) {
                    retval.push(file);
                }
            }
        }
        const dir_content_files: string[][] = await Promise.all(dir_content);
        return [...retval, ...dir_content_files.flat()];
    } catch (error) {
        console.error(error);
        return [];
    }
}


//======= Get the content from the test directory =========================================

/**
 * Intermediate type: the _relative_ path of a file in the directory (to be used in the generated EPUB file) and the content of the 
 * corresponding file.
 */
 interface FileContent {
    path: string,
    content: Buffer,
}

/**
 * Return the list of file names in a directory and then getting the content of all those; ready to be put into an archive.
 * 
 * The entry directory should be a relative path.
 * 
 * @param entry_dir 
 * @param filter filter to remove unwanted file names from the result
 * @returns 
 */
async function getContent(entry_dir: string): Promise<FileContent[]> {
    const file_names: string[]  = await recursiveWalk(entry_dir, (fname: string): boolean => !(ignoredFiles.includes(path.basename(fname))));
    const content: Buffer[]     = await Promise.all(file_names.map((fname) => fs.readFile(fname)));
    const retval: FileContent[] = [];

    for (let i = 0; i < file_names.length; i++) {
        retval.push({
            // What we need here is the file name relative to the start directory,
            // this is what the zip file creation uses
            // The last step removes the '/' character at the start of the string
            path    : file_names[i].split(entry_dir)[1].slice(1),
            content : content[i],
        });
    }
    return retval;
}


/**
 * Create a new EPUB file starting at the directory containing the deflated test content.
 * 
 * @param test_dir 
 */
export async function createEPUB(test_dir: string): Promise<void> {
    // This creates an in-memory archive
    const the_book: JSZip = new JSZip();

    // Add the first, uncompressed entry (per EPUB spec)
    the_book.file('mimetype', Constants.EPUB_MEDIA_TYPE, {compression: 'STORE'})

    // Get all the content for that directory:
    const content: FileContent[] = await getContent(test_dir);

    // Put the full content into the in-memory archive
    for (const file of content) {
        the_book.file(file.path, file.content, {compression: 'DEFLATE'});
    }

    // Create the zip file in memory as a large binary Buffer
    const epub: Buffer = await the_book.generateAsync({
        type               : 'nodebuffer',
        mimeType           : Constants.EPUB_MEDIA_TYPE,
        compressionOptions : {
            level : 9,
        },
    });

    // Final step: write the epub content onto a file
    return fs.writeFile(`${test_dir}.epub`, epub);
}
