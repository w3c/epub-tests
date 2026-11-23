/**
 * One-off script to reuse test results, submitted to the EPUB 3.3 specification,
 * for the EPUB 3.4 CR exit criteria. The old tests are copied and slightly transformed
 * based on the history test information JSON file that also includes data about
 * change of names and/or deprecations of individual tests.
 *
 * When transforming an old test, the following actions have been taken
 *
 * - Unless the date field appears in the report, the new version's date is set to 2023-05-25,
 * which is the the EPUB 3.3 publication date
 * - The name of the report is expanded with the parenthetical note of "(EPUB 3.3 test report)"
 * - The "tested-by" field is set to "third party"
 * - For each test reference in the submission, the old test result is copied to the new
 * version, unless
 *     - the test has been deprecated for EPUB 3.4, in which case the test result is simply dropped
 *       from the output
 *     - the test has been renamed for EPUB 3.4, in which case the test results are added to
 *       new test report using the new name
 *
 * The script has the 3.3->3.4 transfer built-in for now (it is ran once only after all), but
 * when the time comes, it will be trivial to adapt it to the, say, 3.4->3.5 case.
 *
 * Note that this script is very inefficient (it goes through the history list many times,
 * it uses sync read and write for the test files instead of being asynchronous)
 * but it only runs once, so who cares...
 *
 * Also: at this moment, it uses the Deno I/O functions; at this moment (Nov. 2026), it
 * is not clear what the fate of Deno will be in future. It may have to be rewritten for Node.js
 * (or whatever TS environment will be in vogue when it has to be reused.)
 */

import { Raw_ImplementationReport, TESTED_BY } from "./lib/types.ts";

/************************************************************************************************* */
/**
 * The list of 3.3 tests, except for the tests for voyager, readium/thorium, and Kobo,
 * which is supposed to be done again by the original developer.
 */
const originals = [
    "access-android.json",
    "apple-ios.json",
    "apple-macos.json",
    "colibrio-reader-framework-3_3.json",
    "google-android.json",
    "google-ios.json",
    "google-web.json",
    "tolino-webreader.json",
    "vitalsource-android.json",
    "vitalsource-ios.json",
    "vitalsource-mac-desktop.json",
    "vitalsource-web.json",
    "vitalsource-windows-desktop.json"
];

/************************************************************************************************* */
/**
 * These are the files at the time of running the script for EPUB 3.4. To be updated
 * for future setups
 */
const HISTORY_FILE = "../../history/test-version-mapping.json";
const INPUT_FILES = "../../epub33/reports/";
const OUTPUT_FILES = "../../reports/";

const EPUB33_REMARK  = "(EPUB 3.3 test report)";
const FALLBACK_DATE  = "2023-05-25";
const LATEST_VERSION = "3.4";

/************************************************************************************************* */
/*
* Rough structure of the history file; rough, because only those parts are
* details which are relevant for the conversion.
*/
type TestStatus = "revised" | "original" | "renamed" | "carried-forward" | "active" | "deprecated";
interface LineageEntry {
    version:       string;
    id:            string | null;
    status:        TestStatus;
    revisionNotes: string;
};
interface TestRecord {
    category:        string;
    status:          TestStatus;
    firstIntroduced: string;
    deprecatedIn:    string | null;
    testFolder:      string;
    lineage:         LineageEntry[];
};
interface TestHistory {
    [key: string]: TestRecord
};

interface History {
    // deno-lint-ignore no-explicit-any
    metadata : Record<string, any>,
    tests    : TestHistory
};


/**
 * Mapping the old test file name to the new. If the return is an empty
 * string, this means the test has been removed.
 *
 *
 * @param history
 * @param key
 * @returns
 */
function mapKey(history: TestHistory, key: string): string {
    if (key in history) {
        // The test has not been renamed, but is possibly deprecated
        return history[key].status !== "deprecated" ? key : "";
    } else {
        // we have to find out whether the test has changed its name; this is through the lineage
        for (const tKey in history) {
            // filter out the deprecated cases
            if (history[tKey].status === "deprecated") continue;
            const lineage = history[tKey].lineage;
            if (lineage.length > 1 && lineage[0].id === key) {
                // The last entry should be for the latest EPUB version
                const details = lineage[lineage.length - 1];
                if (details.version === LATEST_VERSION && details.status === "renamed" && details.id !== null) {
                    return details.id;
                }
            }
        }
        // if we get here, then the test was dropped altogether
        return "";
    }
}

/**
 * Create a new report from the old one.
 *
 * @param history
 * @param input
 * @returns
 */
function createNewReport(history: TestHistory, input: Raw_ImplementationReport): Raw_ImplementationReport {
    const output: Raw_ImplementationReport = {
        name: `${input.name} ${EPUB33_REMARK}`,
        tests: {},
    }

    // Copy/modify the metadata
    output.date         = input.date ?? FALLBACK_DATE;
    output["tested-by"] = TESTED_BY.THIRD_PARTY;

    if (input.variant)      output.variant = input.variant;
    if (input.ref)          output.ref = input.ref;

    // Copy/modify/remove old test results
    for (const key in input.tests) {
        const newKey: string = mapKey(history, key);
        // An empty new key means the test has been deprecated, ie, it is silently dropped
        if (newKey.length > 0) output.tests[newKey] = input.tests[key];
    }
    return output;
}

/**
 * Handle one test: gets the data, creates a new one, and stores the JSON data
 */
function handleOneTest(history: History, name: string): void {
    const input_fname = `${INPUT_FILES}${name}`;
    const output_fname = `${OUTPUT_FILES}${name}`;
    const input = JSON.parse(Deno.readTextFileSync(input_fname)) as Raw_ImplementationReport;
    const output = createNewReport(history.tests, input);
    Deno.writeTextFileSync(output_fname,JSON.stringify(output,null,4));
}

function main() {
    const history = JSON.parse(Deno.readTextFileSync(HISTORY_FILE)) as History;
    for (const result of originals) handleOneTest(history, result);
}

main()
