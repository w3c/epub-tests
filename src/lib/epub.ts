/**
 * Module to create an epub instance based on the deflated folder content with the same name.
 * 
 * @packageDocumentation
 */


import * as fs_old_school from "fs";
const fs = fs_old_school.promises;
import * as path from "path";

import JSZip = require('jszip');

import { Constants } from './types';

//======= Get the content from the test directory =========================================

/**
 * Intermediate type: the relative path of a file in the directory (to be used in the generated EPUB file) and the content of the 
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
async function get_content(entry_dir: string, filter?: (f:string) => boolean): Promise<FileContent[]> {
    // Recursive walk through the directory. The return value are the full paths of the files,
    // suitable for a file read
    const recursive_walk = async (dir: string): Promise<string[]> => {
        try {
            const content: string[] = await fs.readdir(dir);
            let retval: string[] = [];
        
            for (const fname of content) {
                const file = path.resolve(dir,fname);
                const stat = await fs.stat(file);
                if (stat && stat.isDirectory()) {
                    retval = [...retval, ...await recursive_walk(file)];
                } else {
                    if (typeof filter === 'undefined' || (filter && filter(file))) {
                        retval.push(file);
                    }
                }
            }
            return retval;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    const file_names: string[]  = await recursive_walk(entry_dir);
    const content: Buffer[]     = await Promise.all(file_names.map((fname) => fs.readFile(fname)));
    const retval: FileContent[] = [];

    for (let i = 0; i < file_names.length; i++) {
        retval.push({
            // What we need here is the file name relative to the start directory,
            // this is what the zip file creation uses
            path    : file_names[i].split(entry_dir)[1].slice(1),
            content : content[i],
        });
    }
    return retval;
}

//===================== Generate the EPUB =========================================
/** 
 * These files should be ignored when reading the content of the EPUB testing directory 
 * 
 * - `mimetype`: must be put into the EPUB file explicitly at first and non-compressed
 * - `.DS_Store`: a MacOS artefact that should be ignored altogether
 */
const ignored_files: string[] = ['.DS_Store', 'mimetype'];

/**
 * The file names to be filtered out for an EPUB zip archive when gathering content to be compressed
 *  
 * @param fname 
 * @returns 
 */
function opf_filter(fname: string): boolean {
    return !(ignored_files.includes(path.basename(fname)));
}


/**
 * Create a new EPUB file starting at the directory containing the deflated test content.
 * 
 * @param test_dir 
 */
export async function create_epub(test_dir: string): Promise<void> {
    const the_book: JSZip = new JSZip();

    // Add the first, uncompressed entry (per EPUB spec)
    the_book.file('mimetype', Constants.EPUB_MEDIA_TYPE, {compression: 'STORE'})

    // Get all the content for that directory:
    const content: FileContent[] = await get_content(test_dir, opf_filter);

    // Put the whole content into the zip file (for the time being this means done in memory)
    for (const file of content) {
        the_book.file(file.path, file.content, {compression: 'DEFLATE'});
    }

    // We are done, we can now create the zip file in memory
    const epub: Buffer = await the_book.generateAsync({
        type               : 'nodebuffer',
        mimeType           : Constants.EPUB_MEDIA_TYPE,
        compressionOptions : {
            level : 9,
        },
    });

    // Final step: write the epub content onto a file
    fs.writeFile(`${test_dir}.epub`, epub);
}

// async function main(fname:string): Promise<void> {
//     await create_epub(fname);
//     console.log('done...');
// }

// main('local_tests/confreq-mathml-rs-behavior');

