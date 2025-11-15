/**
 * Entry point for the generation of the EPUB 3 test descriptions and test results. Running this script will
 * generate a number of HTML fragments containing sections with tables containing the essential metadata for each test,
 * the test results showing the implementation results for each tests, and it will also create an OPDS file that
 * may help to download and execute the tests.
 *
 * The HTML fragments, to be stored, eventually, in separate files, in the `/generate/fragments` directory of the repository.
 * These fragments are included in the final report using the `data-include` feature of respec as follows:
 *
 * - the `/index.html` file is the main entry point for the report, and it includes the description of each test with pointers to the specifications themselves, as well as a list of contributors;
 * - the `/results.html` file contains the results of the tests, listing the implementation results for each test and for each reported implementation.
 *
 * The tests themselves are a collection of EPUB 3 books, each instance testing a specific feature of the EPUB 3 specification.
 * They are present both as EPUB 3 books, i.e., as zipped files, as well as deflated EPUB contents, i.e., as directories; all tests are available in the `/tests`
 * directory of the current working repository.
 *
 * The implementation results are stored in the `/reports` directory. Each implementation
 * report is stored in a separate JSON file, containing some metadata about the implementation, and the results of the tests.
 *
 * Finally, the script also creates a template implementation result file (`/reports/xx-template.json`) that can be used to create new implementation reports.
 *
 * ### Changing the configuration of the script
 *
 * The `/generate/src/lib/types.ts` file contains, as part of the `Constants` namespace, the file and directories names for tests, final place for fragments, etc.
 * If the repository is reorganized or cloned, that file should be updated to reflect the new structure.
 *
 * The current setup is based on release 3.4 of the EPUB 3 specification. See the separate `/generate/NewVersion.md` file for the steps to follow to
 * update the repository for a new version of the EPUB 3 specification.
 *
 * @license [W3C Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software)
 */



import { argv }           from "node:process";
import * as fs_old_school from "node:fs";
const fs = fs_old_school.promises;

import { TestData, ReportData, Raw_ImplementationReport, Constants, HTMLFragments } from './lib/types.ts';
import { getTestData, getReportData, getTemplate }                                  from "./lib/data.ts";
import { createReport }                                                             from "./lib/html.ts";
import { applyConfigurationOptions }                                                from './lib/config.ts';
import { OPDS, createOPDS }                                                         from './lib/opds.ts'


/**
 * Force today's date into a respec source.
 * @param fname File name for the resource document
 */
async function adjust_date(fname: string): Promise<void> {
    const text: string = await fs.readFile(fname, 'utf-8');
    const new_text = text.replace(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, (new Date()).toISOString().split('T')[0]);
    return fs.writeFile(fname, new_text);
}

/**
 * Main entry point: generate the reports' html fragment files (i.e., the real "meat" for the data) and a template file
 */
async function main() {
    const test_dir = (argv.length >= 3 && argv[2] === '-t') ? Constants.TESTS_DIR_DEBUG : Constants.TESTS_DIR ;
    const test_data: TestData[]              = await getTestData(test_dir);
    const report_data: ReportData            = await getReportData(test_data, Constants.TEST_RESULTS_DIR);
    const template: Raw_ImplementationReport = getTemplate(report_data);

    const final_report_data: ReportData = applyConfigurationOptions(report_data);

    const { implementations, consolidated_results, complete_results, tests, creators }: HTMLFragments = createReport(final_report_data);

    const opds_data: OPDS = createOPDS(test_data);

    await Promise.all([
        fs.writeFile(Constants.IMPL_FRAGMENT, implementations, 'utf-8'),
        fs.writeFile(Constants.CONSOLIDATED_RESULT_FRAGMENT, consolidated_results, 'utf-8'),
        fs.writeFile(Constants.COMPLETE_RESULT_FRAGMENT, complete_results, 'utf-8'),
        fs.writeFile(Constants.TEST_FRAGMENT, tests, 'utf-8'),
        fs.writeFile(Constants.CREATORS_FRAGMENT, creators, 'utf-8'),
        fs.writeFile(Constants.TEST_RESULTS_TEMPLATE, JSON.stringify(template, null, 4)),
        fs.writeFile(`${Constants.OPDS_DIR}/${Constants.DOC_OPDS}`, JSON.stringify(opds_data, null, 4)),
        adjust_date(`${Constants.DOCS_DIR}/${Constants.DOC_TEST_RESULTS}`),
        adjust_date(`${Constants.DOCS_DIR}/${Constants.DOC_TEST_DESCRIPTIONS}`),
    ]);
}

main();
