"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Constants
 */
var Constants;
(function (Constants) {
    /** Location for the tests themselves */
    Constants.TESTS_DIR = 'tests';
    /** Location for the implementation reports */
    Constants.TEST_RESULTS_DIR = 'reports';
    /** Location for the final report */
    Constants.DOCS_DIR = 'results';
    /** Location for the implementation report templates */
    Constants.TEST_RESULTS_TEMPLATE = `${Constants.TEST_RESULTS_DIR}/xx-template.json`;
    /** Base URL for the tests in the repository */
    Constants.TEST_URL_BASE = 'https://github.com/iherman/epub-testing/tree/main/tests';
    /** Location of the OPF file within the test directory */
    Constants.OPF_FILE = 'OPS/package.opf';
    /** Location for the HTML fragment on implementation lists */
    Constants.IMPL_FRAGMENT = `${Constants.DOCS_DIR}/fragments/implementations.html`;
    /** Location for the HTML fragment on implementation results */
    Constants.RESULT_FRAGMENT = `${Constants.DOCS_DIR}/fragments/results.html`;
    /** Location for the HTML fragment on test metadata */
    Constants.TEST_FRAGMENT = `${Constants.DOCS_DIR}/fragments/tests.html`;
    /** (Relative) File name of the test results */
    Constants.DOC_TEST_RESULTS = 'index.html';
    /** (Relative) File name of the test descriptions */
    Constants.DOC_TEST_DESCRIPTIONS = 'tests.html';
    /** CSS Class name for table cells with positive test results */
    Constants.CLASS_PASS = "pass";
    /** CSS Class name for table cells with negative test results */
    Constants.CLASS_FAIL = "fail";
    /** CSS Class name for columns containing the ID-s */
    Constants.CLASS_COL_ID = "col_id";
    /** CSS Class name for columns containing test table references */
    Constants.CLASS_COL_TREF = "col_tref";
    /** CSS Class name for columns containing title */
    Constants.CLASS_COL_TITLE = "col_title";
    /** CSS Class name for columns containing spec references */
    Constants.CLASS_COL_SREF = "col_sref";
})(Constants = exports.Constants || (exports.Constants = {}));
//# sourceMappingURL=types.js.map