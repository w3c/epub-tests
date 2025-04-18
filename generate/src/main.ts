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
