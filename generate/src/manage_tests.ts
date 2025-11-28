import { Constants }                             from './lib/types.ts';
import { getListDir, isDirectory, get_opf_file } from "./lib/data.ts";
import { createEPUB }                            from './lib/epub.ts';
import { callbacks }                             from './lib/opf_callbacks.ts';
import { Command }                               from 'commander';

type Callback = (text: string) => string;

/**
 * Main entry point: go through all the tests, possibly modify their OPF file (depending on what is in the `callback` array)
 * and generate the epub files themselves.
 */
async function main() {
    const program = new Command();
    program
        .name('test2epub')
        .description('Generate the epub files from the test file, with possibly modifying the OPF file in the process.')
        .usage('[options]')
        .option('-d --debug', 'run the script on the debug test suite')
        .option('-m --modify', 'modify the OPF contents')
        .option('-n --noepub', 'do not generate EPUB files, just do the modifications')
        .parse(["", "", ...Deno.args]);
    const options = program.opts();

    const debug  = options.debug ?? false;
    const modify = options.modify ?? false;
    const noepub = options.noepub ?? false;

    const front_end = async (dir_test: string): Promise<void> => {
        // Get the OPF file in the EPUB way: get the container file to get the name of the OPF file
        const opf_file_name = await get_opf_file(dir_test);
        const opf_file      = `${dir_test}/${opf_file_name}`;
        const package_xml   = await Deno.readTextFile(opf_file);

        // Perform whatever is to be performed on the opf file
        let new_opf = package_xml;
        for (const callback of callbacks) {
            new_opf = callback(new_opf);
        }

        // Write back the new opf file
        await Deno.writeTextFile(opf_file, new_opf);
    }

    // Get the final data for files and directories, depending on the debug flag
    const [
        TESTS_DIR,
        _IMPL_FRAGMENT,
        _CONSOLIDATED_RESULT_FRAGMENT,
        _COMPLETE_RESULT_FRAGMENT,
        _TEST_FRAGMENT,
        _CREATORS_FRAGMENT,
        _TEST_RESULTS_DIR,
        _TEST_RESULTS_TEMPLATE,
        _OPDS,
        _DOC_TEST_RESULTS,
        _DOC_TEST_DESCRIPTIONS
    ] = Constants.final_constants(debug);

    const dirs: string[] = await getListDir(TESTS_DIR, isDirectory);

    // If required, modify the OPF-s of the existing tests
    if (modify) {
        const modify_promises = dirs.map((dir_test) => front_end(`${TESTS_DIR}/${dir_test}`));
        await Promise.all(modify_promises);
    }
    // If required, generate the epub files
    if (noepub === false) {
        const epub_promises: Promise<void>[] = dirs.map((test) => createEPUB(`${TESTS_DIR}/${test}`));
        const results = await Promise.allSettled(epub_promises);
        const errors: string[] = [];
        for (const entry of results) {
            if (entry.status === "rejected") {
                errors.push(entry.reason);
            }
        }
        if (errors.length > 0) console.error(`Errors when managing epub tests: ${errors}`);
    }
}

await main();
