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

import { getListDir, isDirectory, get_opf_file } from './lib/data.ts';
import { Constants }                             from './lib/types.ts';
import { createEPUB }                            from './lib/epub.ts';

/**
 * Main entry point for the separate metadata extension: modify the OPF file for each test directory, and generate the epub files themselves.
 */
async function main(new_metadata: string[], cut_off_pattern: string): Promise<void> {
    const dir_name: string = Constants.TESTS_DIR;
    const handle_single_test_metadata = async (file_name: string): Promise<void> => {
        const opf_file_name = await get_opf_file(file_name)
        const opf_file = await `${file_name}/${opf_file_name}`;
        const package_xml = await Deno.readTextFile(opf_file);
        const lines: string[] = package_xml.split(/\n/);
        // let us avoid doing things twice...
        if (lines.indexOf(new_metadata[0]) === -1) {
            //1. Find the cut-off point, ie, where the new lines must be inserted:
            let index = -1;
            for (index = 0; index < lines.length; index++) {
                if (lines[index].includes(cut_off_pattern)) {
                    break
                }
            }

            // 2. insert the extra data
            const final_lines = [...lines.slice(0,index), ...new_metadata, ...lines.slice(index)];

            // 3. Write back the data into the OPF file
            await Deno.writeTextFile(opf_file, final_lines.join('\n'));
        }
    }

    const dirs: string[] = await getListDir(dir_name, isDirectory);

    // Modify the metadata content for the tests
    const dir_promises: Promise<void>[] = dirs.map((test) => handle_single_test_metadata(`${dir_name}/${test}`));
    await Promise.all(dir_promises);

    // Generate the epub files themselves
    const epub_promises: Promise<void>[] = dirs.map((test) => createEPUB(`${dir_name}/${test}`));
    await Promise.all(epub_promises);
}


// =========================== Entry point for adding expressions for rights ========
/**
 * The extra metadata items to be added to the package metadata
 */
const new_metadata: string[] = [
    '    <dc:publisher>W3C</dc:publisher>',
]

/**
 * The pattern to be used to find the target for the new metadata entries. They will be inserted
 * _before_ the first occurrence of the pattern among the other metadata lines.
 */
const cutoff_meta: string = '<dc:title';

main(new_metadata, cutoff_meta);
