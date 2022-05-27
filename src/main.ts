import { argv } from "process";
import * as fs_old_school from "fs";
const fs = fs_old_school.promises;

import { TestData, ReportData, ImplementationReport, Constants } from './lib/types';
import { get_test_metadata, get_report_data, get_template } from "./lib/data";
import { create_report } from "./lib/html";
import { apply_configuration_options } from './lib/config';
import { OPDS, create_opds } from './lib/opds'


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
    const test_data: TestData[] = await get_test_metadata(test_dir);
    const report_data: ReportData = await get_report_data(test_data, Constants.TEST_RESULTS_DIR);

    const template: ImplementationReport = get_template(report_data);

    const final_report_data = apply_configuration_options(report_data);
    const {implementations, results, tests, creators} = create_report(final_report_data);
    const opds_data = create_opds(test_data);

    console.log(JSON.stringify(opds_data, null, 4));
    
    await Promise.all([
        fs.writeFile(Constants.IMPL_FRAGMENT, implementations, 'utf-8'),
        fs.writeFile(Constants.RESULT_FRAGMENT, results, 'utf-8'),
        fs.writeFile(Constants.TEST_FRAGMENT, tests, 'utf-8'),
        fs.writeFile(Constants.CREATORS_FRAGMENT, creators, 'utf-8'),
        fs.writeFile(Constants.TEST_RESULTS_TEMPLATE, JSON.stringify(template, null, 4)),
        adjust_date(`${Constants.DOCS_DIR}/${Constants.DOC_TEST_RESULTS}`),
        adjust_date(`${Constants.DOCS_DIR}/${Constants.DOC_TEST_DESCRIPTIONS}`),
    ]);
}

main();
