"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_old_school = require("fs");
const fs = fs_old_school.promises;
const types_1 = require("./lib/types");
const data_1 = require("./lib/data");
const html_1 = require("./lib/html");
/**
 * Force today's date into a respec source.
 * @param fname File name for the resource document
 */
async function adjust_date(fname) {
    const text = await fs.readFile(fname, 'utf-8');
    const new_text = text.replace(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, (new Date()).toISOString().split('T')[0]);
    return fs.writeFile(fname, new_text);
}
/**
 * Main entry point: generate the reports' html fragment files (i.e., the real "meat" for the data) and a template file
 */
async function main() {
    const report_data = await (0, data_1.get_report_data)(types_1.Constants.TESTS_DIR, types_1.Constants.TEST_RESULTS_DIR);
    const template = (0, data_1.get_template)(report_data);
    const { implementations, results, tests } = (0, html_1.create_report)(report_data);
    await Promise.all([
        fs.writeFile(types_1.Constants.IMPL_FRAGMENT, implementations, 'utf-8'),
        fs.writeFile(types_1.Constants.RESULT_FRAGMENT, results, 'utf-8'),
        fs.writeFile(types_1.Constants.TEST_FRAGMENT, tests, 'utf-8'),
        fs.writeFile(types_1.Constants.TEST_RESULTS_TEMPLATE, JSON.stringify(template, null, 4)),
        adjust_date(`${types_1.Constants.DOCS_DIR}/${types_1.Constants.DOC_TEST_RESULTS}`),
        adjust_date(`${types_1.Constants.DOCS_DIR}/${types_1.Constants.DOC_TEST_DESCRIPTIONS}`),
    ]);
}
main();
//# sourceMappingURL=main.js.map