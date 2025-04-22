// deno-lint-ignore-file no-namespace
/* eslint-disable no-multi-spaces */
/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Constants and types used in the EPUB test suite presentation.
 * 
 * ---
 * 
 * Note: the term "consolidation" is used, throughout this package, for the following situation. 
 * Some implementations may come in different variants: i.e., the same name (typically designating the core engine) 
 * but a separate versions ("variants") for different environments, typically iOS, Android, or Web.
 * Per W3C these are not considered to be independent implementations and, therefore, 
 * they should be considered as one implementation as far as the
 * formal CR report is concerned. On the other hand, there is value to keep 
 * the various implementation results separated.
 * 
 * To keep this, the report generator (and the display of the results) "duplicates" the list of 
 * implementations: one is the original (ie, with variants kept separated) and
 * one where the result of all the variants are "consolidated" into a unique implementation report. 
 * The duplication of these data is then reflected in the way the reports are displayed. 
 *  
 * @license [W3C Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software)
 * @packageDocumentation
 * 
 */

/**
 * Constants
 */
export namespace Constants {
    /** Location for the tests themselves */
    export const TESTS_DIR: string = '../../tests';

    export const TESTS_DIR_DEBUG: string = '../../local_tests';

    /** Location for the implementation reports */
    export const TEST_RESULTS_DIR: string = '../../reports';

    /** Location for the final report */
    export const DOCS_DIR: string = '../../';

    /** Relative location for the final OPDS data */
    export const OPDS_DIR: string = '../../opds';

    export const OPDS_DIR_URL: string = 'https://w3c.github.io/epub-tests/opds';

    /** (Relative) File name of the OPDS file */
    export const DOC_OPDS: string = 'opds.json';

    /** (Relative) File name of the OPDS file */
    export const DOC_OPDS_COVER_PNG: string = 'test_cover.png';

    /** (Relative) File name of the OPDS file */
    export const DOC_OPDS_COVER_SVG: string = 'test_cover.svg';

    /** Location for the implementation report templates */
    export const TEST_RESULTS_TEMPLATE: string = `${TEST_RESULTS_DIR}/xx-template.json`;

    /** Base URL for the tests in the repository */
    export const TEST_URL_BASE: string = 'https://github.com/w3c/epub-tests/tree/main/tests';

    /** Base URL for the test epub file, accessible via github.io */
    export const TEST_DOWNLOAD_URL_BASE: string = 'https://github.com/w3c/epub-tests/raw/main/tests';

    /** Location of the container file within the test directory */
    export const CONTAINER_FILE: string = 'META-INF/container.xml';

    /** Location for the HTML fragment on implementation lists */
    export const IMPL_FRAGMENT: string = `${DOCS_DIR}/generate/fragments/implementations.html`;

    /** Location for the HTML fragment on the consolidated implementation results */
    export const CONSOLIDATED_RESULT_FRAGMENT: string = `${DOCS_DIR}/generate/fragments/consolidated_results.html`;

    /** Location for the HTML fragment on the detailed implementation results */
    export const COMPLETE_RESULT_FRAGMENT: string = `${DOCS_DIR}/generate/fragments/complete_results.html`;

    /** Location for the HTML fragment on test metadata */
    export const TEST_FRAGMENT: string = `${DOCS_DIR}/generate/fragments/tests.html`;

    /** Location for the HTML fragment on test creators */
    export const CREATORS_FRAGMENT: string = `${DOCS_DIR}/generate/fragments/creators.html`;

    /** (Relative) File name of the test results */
    export const DOC_TEST_RESULTS: string = 'results.html';

    /** (Relative) File name of the test descriptions */
    export const DOC_TEST_DESCRIPTIONS: string = 'index.html';

    /** 
     * List of test ID-s whose creators should not be considered for display; these appear in some I18N tests
     * that are used to test the bidi of the creator strings themselves.
     */
    export const IGNORE_CREATOR_ID: string[] = ['pkg-creator-order', 'pkg-dir_creator-rtl'];

    /** List of creator names that should not be considered for display */
    export const IGNORE_CREATORS: string[] = ['Creator', '(Unknown)'];

    /** CSS Class name for table cells with positive test results */
    export const CLASS_PASS: string = "pass";

    /** CSS Class name for table cells with negative test results */
    export const CLASS_FAIL: string = "fail";

    /** CSS Class name for table cells with non applicable tests */
    export const CLASS_NA: string = "na";

    /** CSS Class name for table cells with non test results */
    export const CLASS_UNTESTED: string = "untested";

    /** CSS Class name for columns containing the ID-s */
    export const CLASS_COL_ID: string = "col_id";

    /** CSS Class name for columns containing the Requirement flag */
    export const CLASS_COL_REQ: string = "col_req";

    /** CSS Class name for the list of creators  */
    export const CLASS_CREATOR_LIST: string = "creator_list";

    /** Config file location */
    export const CONFIG_FILE: string = `../config.json`;

    export const EPUB_MEDIA_TYPE: string = 'application/epub+zip';

    export const OPTIONAL_FEATURES: string[] = ["Media Overlays", "Structural Semantics", "Scripting"];
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
     * EPUB Version number. The value of the version is the revision where the test has been added in.
     */
    version: string;

    /**
     * This is a series of URL strings, referring to the section in the spec this test is pertinent to.
     */
    references: string[];
    
    /**
     * The value of the 'modified' string from the package file
     */
    modified: string;

    /**
     * Whether this test corresponds to a _MUST_, _SHOULD_, or _MAY_ statement
     */
    required: ReqType;
}


/**
 * (Internal) values for the test scores.
 * 
 * (Note the duality of enum and a namespace, which makes it possible to use the term in a more confortable way
 * in the code, while keeping the enum values as strings. This is a bit of a hack, but it works well.)
 */
export enum Score {
    FAIL           = "fail",
    PASS           = "pass",
    NOT_APPLICABLE = "n/a",
    UNTESTED       = "todo",
}

export namespace Score {
    /** Function used for the final rendering of the data.  */
    export function get_class(s: Score): string {
        switch (s) {
        case Score.FAIL: 
            return Constants.CLASS_FAIL;
        case Score.PASS: 
            return Constants.CLASS_PASS;
        case Score.NOT_APPLICABLE: 
            return Constants.CLASS_NA;
        case Score.UNTESTED: 
        default: 
            return Constants.CLASS_UNTESTED;
        }
    }

    /** Return the string value of an enum. */
    export function get_td(s: Score): string {
        return s as string;
    }
}


/**
 * Data about a single implementer: it is necessary to the final 
 * report about each implementer.
 */
export interface Implementer {
    /** Name of the implementation, to appear in the final report. */
    name     : string;

    /** Name of a variant (if applicable), to appear in the final report. */
    variant ?: string;

    /** If present, the name becomes a hyperlink to this URL. */
    ref     ?: string
}


/**
 * The report of each implementer: beyond the (meta)data about the implementation itself it 
 * includes an object listing tests results, one for each test that has been run. 
 * The index is the ID of a test.
 */
export interface ImplementationReport extends Implementer {
    tests: {
       [index: string]: Score; 
    }
}


/**
 * The report of each implementer in JSON format.
 * 
 * (In an ideal world, this should be identical to ImplementationReport, but by the time
 * this was improved to use more values, tests had been already done, and it was not feasible
 * to change the existing test results. Oh well...)
 */
export interface Raw_ImplementationReport extends Implementer {
    tests: {
        [index:string]: (boolean|string|null)
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
    implementations: Score[];
}


/**
 * A single set (essentially a table rows) of all implementation data for a specific "section" 
 * (i.e., the "coverage" value in the tests)
 */
export interface ImplementationTable {
    header          : string;
    implementations : ImplementationData[];
}


/**
 * Complete data needed for the display of the test results. It is the result of combining the test
 * results, the metadata about the implementations, and the metadata about the tests.
 * 
 * Note (again) that the order for implementers the order of extracted implementations.
 */
export interface ReportData {
    tables                    : ImplementationTable[];
    consolidated_tables       : ImplementationTable[];
    implementers              : Implementer[];
    consolidated_implementers : Implementer[];
} 

/**
 * Data returned from the HTML generation
 */
export interface HTMLFragments {
    implementations      : string, 
    consolidated_results : string,
    complete_results     : string, 
    tests                : string, 
    creators             : string
}
