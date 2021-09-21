/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Constants
 */
export namespace Constants {
    /** Location for the tests themselves */
    export const TESTS_DIR: string = 'tests';

    /** Location for the implementation reports */
    export const TEST_RESULTS_DIR: string = 'reports';

    /** Location for the final report */
    export const DOCS_DIR: string = 'results';

    /** Location for the implementation report templates */
    export const TEST_RESULTS_TEMPLATE: string = `${TEST_RESULTS_DIR}/xx-template.json`;

    /** Base URL for the tests in the repository */
    export const TEST_URL_BASE: string = 'https://github.com/iherman/epub-testing/tree/main/tests';

    /** Location of the OPF file within the test directory */
    export const OPF_FILE: string = 'OPS/package.opf';

    /** Location for the HTML fragment on implementation lists */
    export const IMPL_FRAGMENT: string = `${DOCS_DIR}/fragments/implementations.html`;

    /** Location for the HTML fragment on implementation results */
    export const RESULT_FRAGMENT: string = `${DOCS_DIR}/fragments/results.html`;

    /** Location for the HTML fragment on test metadata */
    export const TEST_FRAGMENT: string = `${DOCS_DIR}/fragments/tests.html`;

    /** (Relative) File name of the test results */
    export const DOC_TEST_RESULTS: string = 'index.html';

    /** (Relative) File name of the test descriptions */
    export const DOC_TEST_DESCRIPTIONS: string = 'tests.html';

    /** CSS Class name for table cells with positive test results */
    export const CLASS_PASS = "pass";

    /** CSS Class name for table cells with negative test results */
    export const CLASS_FAIL = "fail"

    /** CSS Class name for columns containing the ID-s */
    export const CLASS_COL_ID = "col_id";

    /** CSS Class name for columns containing test table references */
    export const CLASS_COL_TREF = "col_tref";

    /** CSS Class name for columns containing title */
    export const CLASS_COL_TITLE = "col_title";

    /** CSS Class name for columns containing spec references */
    export const CLASS_COL_SREF = "col_sref";
}

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
    tables: ImplementationTable[],
    consolidated_tables: ImplementationTable[],
    implementers : Implementer[],
    consolidated_implementers: Implementer[];
} 
