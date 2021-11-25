/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Constants
 */
export namespace Constants {
    /** Location for the tests themselves */
    export const TESTS_DIR: string = 'tests';

    export const TESTS_DIR_DEBUG: string = 'local_tests';

    /** Location for the implementation reports */
    export const TEST_RESULTS_DIR: string = 'reports';

    /** Location for the final report */
    export const DOCS_DIR: string = 'docs/drafts';

    /** Location for the implementation report templates */
    export const TEST_RESULTS_TEMPLATE: string = `${TEST_RESULTS_DIR}/xx-template.json`;

    /** Base URL for the tests in the repository */
    export const TEST_URL_BASE: string = 'https://github.com/w3c/epub-tests/tree/main/tests';

    /** Location of the OPF file within the test directory */
    export const OPF_FILE: string = 'OPS/package.opf';

    /** Location for the HTML fragment on implementation lists */
    export const IMPL_FRAGMENT: string = `${DOCS_DIR}/fragments/implementations.html`;

    /** Location for the HTML fragment on implementation results */
    export const RESULT_FRAGMENT: string = `${DOCS_DIR}/fragments/results.html`;

    /** Location for the HTML fragment on test metadata */
    export const TEST_FRAGMENT: string = `${DOCS_DIR}/fragments/tests.html`;

    /** Location for the HTML fragment on test creators */
    export const CREATORS_FRAGMENT: string = `${DOCS_DIR}/fragments/creators.html`;

    /** (Relative) File name of the test results */
    export const DOC_TEST_RESULTS: string = 'results.html';

    /** (Relative) File name of the test descriptions */
    export const DOC_TEST_DESCRIPTIONS: string = 'index.html';

    /** List of test ID-s whose creators should not be considered for display */
    export const IGNORE_CREATOR_ID: string[] = ['pkg-creator-order', 'pkg-dir_creator-rtl'];

    /** List of creator names that should not be considered for display */
    export const IGNORE_CREATORS: string[] = ['Creator', '(Unknown)'];

    /** CSS Class name for table cells with positive test results */
    export const CLASS_PASS: string = "pass";

    /** CSS Class name for table cells with negative test results */
    export const CLASS_FAIL: string = "fail";

    /** CSS Class name for columns containing the ID-s */
    export const CLASS_COL_ID: string = "col_id";

    /** CSS Class name for columns containing the Requirement flag */
    export const CLASS_COL_REQ: string = "col_req";

    /** CSS Class name for columns containing test table references */
    export const CLASS_COL_TREF: string = "col_tref";

    /** CSS Class name for columns containing title */
    export const CLASS_COL_TITLE: string = "col_title";

    /** CSS Class name for columns containing spec references */
    export const CLASS_COL_SREF: string = "col_sref";

    /** CSS Class name for the list of creators  */
    export const CLASS_CREATOR_LIST: string = "creator_list";

    /** Config file location */
    export const CONFIG_FILE: string = `${DOCS_DIR}/config.json`;

    export const EPUB_MEDIA_TYPE: string = 'application/epub+zip';
}

/**
 * The three possible values for the conformance level of a test.
 */
export type ReqType = "must" | "should" | "may";

/**
 * The metadata related to a single test, extracted from the test's package document
 * and reused by the reporting
 */
export interface TestData {
    /**
     * Unique identifier (usually the file name)
     */
    identifier: string;
    /**
     * Creator of the test
     */
    creators: string[];
    /**
     * Short title of the test
     */
    title: string;
    /**
     * Description of the test
     */
    description: string;
    /**
     * "Coverage" of the test, ie, the broad area that the test belongs to
     */
    coverage: string;
    /**
     * This is a series of URL strings, referring to the section in the spec this test is pertinent to.
     */
    references: string[];
    /**
     * Whether this test corresponds to a _MUST_, _SHOULD_, or _MAY_ statement
     */
    required: ReqType;
}

/**
 * Data about a single implementer: essentially, the data that is necessary to the final report about each implementer
 */
export interface Implementer {
    /** Name of the implementation, to appear in the final report */
    name: string;
    /** Name of a variant, to appear in the final report */
    variant?: string;
    /** If present, the name becomes a hyperlink to this URL */
    ref?: string
}

/**
 * The report of each implementer: beyond the data about the implementation itself it includes an object listing
 * tests results, one for each test that has been run. The index is the ID of the test.
 */
export interface ImplementationReport extends Implementer {
    tests: {
       [index: string]: boolean; 
    }
}


/**
 * The information about a single tests: the original metadata extended with an
 * array of true/false values on whether the implementation passes the test or not. 
 * The order of the test results is in sync with the order of extracted implementations.
 */
export interface ImplementationData extends TestData {
    /**
     * The array of implementation flags for this test
     */
    implementations: boolean[];
}


/**
 * A single set ("table") of implementations, grouped as one "section" (using the "coverage" value in the tests)
 */
export interface ImplementationTable {
    header: string;
    implementations: ImplementationData[];
}


/**
 * Data needed for the display of the test results
 */
export interface ReportData {
    tables: ImplementationTable[];
    consolidated_tables: ImplementationTable[];
    implementers : Implementer[];
    consolidated_implementers: Implementer[];
} 
