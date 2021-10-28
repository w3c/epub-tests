import * as fs_old_school from "fs";
const fs = fs_old_school.promises;

import { ReportData, ImplementationReport, Config, Constants } from './lib/types';
import { get_report_data, get_template } from "./lib/data";
import { create_report } from "./lib/html";
import { get_config, order_implementation_table } from './lib/config';


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
    const config: Config = get_config();

    const report_data: ReportData = await get_report_data(config, Constants.TESTS_DIR, Constants.TEST_RESULTS_DIR);

    const template: ImplementationReport = get_template(report_data);

    const sorted_report_data: ReportData = {
        tables                    : order_implementation_table(config, report_data.tables),
        consolidated_tables       : order_implementation_table(config, report_data.consolidated_tables),
        implementers              : report_data.implementers,
        consolidated_implementers : report_data.consolidated_implementers,
    };

    const {implementations, results, tests, creators} = create_report(sorted_report_data);
    
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
