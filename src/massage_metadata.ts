/**
 * Adding extra metadata to the tests.
 * 
 * Note that this module is _not_ part of the report generation; it is supposed to be ran separately. It is kept alongside the 
 * report generation script because it reuses some tools in the library.
 * 
 * Note that the generation of an EPUB file (ie, the zipped content) is done in a separate module in the library.
 * 
 * 
 *  @packageDocumentation
 */

import * as fs_old_school from "fs";
const fs = fs_old_school.promises;

import {getListDir, isDirectory, get_opf_file} from './lib/data';
import { Constants } from './lib/types';
import { createEPUB } from './lib/epub';

/**
 * Main entry point for the separate metadata extension: modify the OPF file for each test directory, and generate the epub files themselves.
 * 
 * There are two modifications:
 * 1. The specification references should be date-less
 * 2. Add a refine to the categorization with a reference to the specification version
 * 
 */
async function main(): Promise<void> {
    const dir_name: string = Constants.TESTS_DIR_DEBUG;
    const handle_single_test_metadata = async (file_name: string): Promise<void> => {
        const opf_file_name = await get_opf_file(file_name)
        const opf_file = await `${file_name}/${opf_file_name}`;
        const package_xml = await fs.readFile(opf_file,'utf-8');
        let lines: string[] = package_xml.split(/\n/);

        // Change the references first
        lines = lines
            .map((line) => line.replace("TR/epub-33", "TR/epub"))
            .map((line) => line.replace("TR/epub-rs-33", "TR/epub-rs"));

        // Check if the refinement is already there avoid issues running the script twice
        // during development
        const isRefined = lines.find((line) => line.includes('meta refines="#coverage"'));

        if (isRefined === undefined) {
            const coverage = lines.findIndex((line) => line.includes('dc:coverage'));
            if (coverage === -1) {
                console.error(`No coverage found in ${opf_file}`);
            } else {
                // First, add an ID to the coverage line
                lines[coverage] = lines[coverage].replace('dc:coverage', 'dc:coverage id="coverage"');
                // Then, add the refinement
                lines.splice(coverage + 1, 0, '    <meta refines="#coverage" property="schema:version">3.3</meta>');
            }
        }
        
        // 3. Write back the data into the OPF file
        await fs.writeFile(opf_file, lines.join('\n'));
    }

    const dirs: string[] = await getListDir(dir_name, isDirectory);

    // Modify the metadata content for the tests
    const dir_promises: Promise<void>[] = dirs.map((test) => handle_single_test_metadata(`${dir_name}/${test}`));
    await Promise.all(dir_promises);

    // Generate the epub files themselves
    const epub_promises: Promise<void>[] = dirs.map((test) => createEPUB(`${dir_name}/${test}`));
    await Promise.all(epub_promises);
}


main();
