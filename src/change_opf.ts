/**
 * Change the OPF content.
 * 
 * Note that this module is _not_ part of the report generation; it is supposed to be ran separately. It is kept alongside the 
 * report generation script because it reuses some tools in the library.
 * 
 * The generation of an EPUB file (ie, the zipped content) is done in a separate module in the library.
 * 
 * 
 *  @packageDocumentation
 */

import * as fs_old_school from "fs";
const fs = fs_old_school.promises;

import {get_list_dir, isDirectory, get_opf_file} from './lib/data';
import { Constants } from './lib/types';
import { create_epub } from './lib/epub';
import { JSDOM } from 'jsdom';


/**
 * Filter a directory name, removing 'Attic' and 'Done', used in the local debug
 * 
 * @param name proposed directory name
 * @returns 
 */
function filter_locals(name: string): boolean {
    return name.includes('Attic') === false && name.includes('Done') === false && isDirectory(name);
}

/**
 * Change the title to the ID of the test (used as a result of the discussion at TPAC'22)
 * 
 * @param current The text version (ie, before parse) of the OPF content
 * @returns The text version of the new OPF content
 */
function title_to_id(current: string) :string {
    const dom         = new JSDOM(current, {contentType: 'application/xml'});
    const document    = dom.window.document;

    const id_element : Element    = document.getElementsByTagName('dc:identifier')[0];
    const title_element : Element = document.getElementsByTagName('dc:title')[0];

    // see if there is alternate title
    const metas = document.getElementsByTagName('meta');
    let alternate_element: Element;
    for (let i = 0; i < metas.length; i++) {
        const meta = metas[i];
        if (meta.getAttribute('property') === 'dcterms:alternative') {
            alternate_element = meta;
            break;
        }
    }
    if (alternate_element) {
        alternate_element.textContent = id_element.textContent;
    } else {
        title_element.textContent = id_element.textContent;
    }
    return dom.serialize();
}

/**
 * Main entry point for the separate metadata transform: modify the OPF file for each test directory, 
 * and generate the epub files themselves.
 * 
 * @param dir_name the top level name of the directory. Can be TEST_DIR or TEST_DIR_DEBUG 
 * @param transform the transformation function to be used for the OPF content
 * @async
 */
async function main(dir_name: string, transform: (current: string) => string): Promise<void> {
    const handle_single_test_metadata = async (file_name: string): Promise<void> => {
        const opf_file_name = await get_opf_file(file_name);
        const opf_file = await `${file_name}/${opf_file_name}`;
        const package_xml = await fs.readFile(opf_file,'utf-8');
        
        const new_opf_file = transform(package_xml);
        await fs.writeFile(opf_file, new_opf_file);
    }

    const dirs: string[] = await get_list_dir(dir_name, filter_locals);

    // Modify the metadata content for the tests
    const dir_promises: Promise<void>[] = dirs.map((test) => handle_single_test_metadata(`${dir_name}/${test}`));
    await Promise.all(dir_promises);

    // Generate the epub files themselves
    const epub_promises: Promise<void>[] = dirs.map((test) => create_epub(`${dir_name}/${test}`));
    await Promise.all(epub_promises);
}


// =========================== Entry point for adding expressions for rights ======== 

main(Constants.TESTS_DIR, title_to_id);
