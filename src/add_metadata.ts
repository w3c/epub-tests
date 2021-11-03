import * as fs_old_school from "fs";
const fs = fs_old_school.promises;

import {get_list_dir, isDirectory} from './lib/data';
import { Constants } from './lib/types';
import { create_epub } from './lib/epub';

const new_metadata: string[] = [
    '    <link rel="dcterms:rights" href="https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document"/>',
    '    <link rel="dcterms:rightsHolder" href="https://www.w3.org"/>',
]

async function main() {
    const dir_name = 'local_tests'; /* Constants.TEST_DIR */
    const handle_single_test_metadata = async (file_name: string): Promise<void> => {
        const opf_file = `${file_name}/${Constants.OPF_FILE}`;
        const package_xml = await fs.readFile(opf_file,'utf-8');
        const lines: string[] = package_xml.split(/\n/);
        // let us avoid doing things twice...
        if (lines.indexOf(new_metadata[0]) === -1) {
            //1. Find the cut-off point, ie, where the new lines must be inserted:
            let index = -1;
            for (index = 0; index < lines.length; index++) {
                if (lines[index].includes('<meta property')) {
                    break
                }
            }

            // 2. insert the extra data
            const final_lines = [...lines.slice(0,index), ...new_metadata, ...lines.slice(index)];
        
            // 3. Write back the data into the OPF file
            await fs.writeFile(opf_file, final_lines.join('\n'));
        }
    }

    const dirs: string[] = await get_list_dir(dir_name, isDirectory);

    // Modify the metadata content for the tests
    const dir_promises: Promise<void>[] = dirs.map((test) => handle_single_test_metadata(`${dir_name}/${test}`));
    await Promise.all(dir_promises);

    // Generate the epub files themselves
    const epub_promises: Promise<void>[] = dirs.map((test) => create_epub(`${dir_name}/${test}`));
    await Promise.all(epub_promises);
}

main();
