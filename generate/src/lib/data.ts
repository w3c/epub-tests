// deno-lint-ignore-file no-explicit-any
/**
 * Module to extract and gather information necessary to produce the right reports and an overview page for test cases.
 * 
 * Several functions are used by the auxiliary tools to manipulate the packages files for existing tests, not the report
 * generation itself.
 * 
 * @packageDocumentation
 * @license [W3C Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software)
 * 
 */

import { promises as fs } from 'node:fs';
import * as fs_old_school from 'node:fs';
import * as xml2js        from 'npm:xml2js';

import { 
    TestData, 
    Score,
    ImplementationReport, Raw_ImplementationReport,
    ImplementationData, ImplementationTable, 
    Implementer, ReportData, 
    ReqType, 
    Constants, 
} from './types.ts';


/** 
 * Name tells it all...
 * 
 * @internal 
 */
export function stringComparison(a: string, b: string): number {
    if (a < b) return -1;
    else if (a > b) return 1;
    else return 0;
}


/**
 * Get OPF file location, following the official EPUB mechanism: extract the container file
 * (which it at a fix location in the EPUB file) and then extract the OPF file name from there.
 * 
 * @param dirname 
 * @returns fname
 */
export async function get_opf_file(dirname: string): Promise<string> {
    let container_xml: string;
    try {
        container_xml = await fs.readFile(`${dirname}/${Constants.CONTAINER_FILE}`, 'utf-8');
    } catch (_error) {
        console.warn(`Container.xml file could not be accessed in Directory ${dirname}`);
        throw (`"container.xml" file could not be accessed in directory "${dirname}"`)
    }
    // deno-lint-ignore no-explicit-any
    const container_js: any = await xml2js.parseStringPromise(container_xml, {
        trim          : true,
        normalizeTags : true,
        explicitArray : true,
    });
    try {
        return container_js.container.rootfiles[0].rootfile[0]["$"]["full-path"];
    } catch (_error) {
        throw (`OPF file name could not be accessed in the "container.xml" file of "${dirname}"`)
    }
}


/**
 * Find and extract the OPF file, following the official EPUB mechanism
 * 
 * @param dirname Directory name
 * @returns OPF content in an XML string
 */
async function get_opf(dirname: string): Promise<string> {
    const fname: string = await get_opf_file(dirname);
    try {
        return await fs.readFile(`${dirname}/${fname}`,'utf-8');
    } catch (_error) {
        throw (`OPF file could not be accessed in directory "${dirname}/${fname}"`)
    }
}


/** 
 * See if a file name path refers to a real file.
 * Note: this function is only used in the utilities, not in the main program.
 * 
 * @internal 
 */
export function isDirectory(name: string): boolean {
    return fs_old_school.lstatSync(name).isDirectory();
}


/** 
 * See if a file name path refers to a real file.
 * Note: this function is only used in the utilities, not in the main program.
 * 
 * @internal 
 */
export function isFile(name: string): boolean {
    return fs_old_school.lstatSync(name).isFile();
}


/**
 * Lists of a directory content.
 * 
 * (Note: by default this returns all the file names. Depending on the final configuration some filters may have to be added.)
 * 
 * @param dir_name name of the directory
 * @param filter_name a function to filter the retrieved list (e.g., no directories)
 * @returns lists of files in the directory
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getListDir(dir_name: string, filter_name: (name: string) => boolean = (_name: string) => true): Promise<string[]> {
    // The filter works on the full path, hence this extra layer
    const file_name_filter = (name: string): boolean => {
        // The 'xx-' prefix are used for the template tests
        return name.startsWith('xx-') === false && filter_name(`${dir_name}/${name}`);
    }
    try {
        const file_names = await fs.readdir(dir_name);
        return file_names.filter(file_name_filter)
    } catch (error) {
        console.warn(`Directory "${dir_name}" could not be accessed ()`);
        throw (`Directory "${dir_name}" could not be accessed (${error})`);
    }
}


/**
 * Get a single implementation report in JSON and convert to its internal format, 
 * 
 * @internal
 */
async function getAnImplementationReport(fname: string): Promise<ImplementationReport> {
    // Just to make the code more readable...
    type raw_index_pair = [string, string|boolean];
    type internal_index_pair = [string, Score];
    interface raw_map {[index: string]: (boolean|string)}
    interface internal_map {[index: string]: Score}
   
    // the boolean|string in the JSON file is transformed into a proper Score
    const transform = (raw_score: (boolean|string)): Score => {
        if (typeof(raw_score) === 'boolean') {
            return (raw_score) ? Score.PASS : Score.FAIL;
        } else if (raw_score === null) {
            return Score.UNTESTED;
        } else {
            return (raw_score.toLowerCase() === "n/a")? Score.NOT_APPLICABLE : Score.UNTESTED;
        }
    };
    // Transform al the tests into proper Scores; just get all the entries transformed
    const transform_tests = (raw: raw_map): internal_map => {
        return Object.entries(raw)
            .map((value: raw_index_pair): internal_index_pair => [value[0], transform(value[1])])
            .reduce((previous: internal_map, current: internal_index_pair): internal_map => {
                previous[current[0]] = current[1];
                return previous;
            },{});
    };

    const raw_data = await fs.readFile(fname, 'utf-8');
    const raw_report: Raw_ImplementationReport = JSON.parse(raw_data) as Raw_ImplementationReport;
    return {
        name    : raw_report.name,
        ref     : raw_report.ref,
        variant : raw_report.variant,
        tests   : transform_tests(raw_report.tests),
    }
}

/**
 * Get all the implementation reports from the file system.
 * The results are sorted using the implementation's name as a key.
 * 
 * @param dir_name the directory that contains the implementation reports
 * @internal
 */
async function getImplementationReports(dir_name: string): Promise<ImplementationReport[]> {
    const implementation_list = await getListDir(dir_name, isFile);

    // Use the 'Promise.all' trick to get to all the implementation reports in one async step rather than going through a cycle
    const report_list_promises: Promise<ImplementationReport>[] = implementation_list.map((file_name) => getAnImplementationReport(`${dir_name}/${file_name}`));
    const proto_implementation_reports: ImplementationReport[] = await Promise.all(report_list_promises);
    const implementation_reports: ImplementationReport[] = proto_implementation_reports.filter((entry) => entry !== undefined); 
    implementation_reports.sort((a,b) => stringComparison(a.name, b.name));

    return implementation_reports
}

/**
 * Create consolidated implementation reports.
 * 
 * Some implementation report appear several times as 'variants' (typically android, ios, or web). These
 * are usually using the same engine, so their results should be merged into one for the purpose of a formal
 * report for the AC.
 *
 * @param implementations the original list of implementation reports
 * @returns a consolidated list of the implementation reports
 */
function consolidateImplementationReports(implementations: ImplementationReport[]): ImplementationReport[] {
    // Results of a test, indexed by the ID of the test itself
    interface TestResults { [index: string]: Score }
    interface Variants { [index: string]: TestResults[]}
    const final: ImplementationReport[] = [];
    const to_be_consolidated: Variants = {};

    // This is the real meat: create a new set of test results combining the test result of the variants.
    // The problem is that different variants may skip some tests, i.e., the
    // final list of test names must be the union of all the tests in the different variants
    const consolidateTestResults = (variant_results: TestResults[]): TestResults => {
        const retval: TestResults = {};

        // Collect all keys together. In theory, all variants have the same keys, but errors may have
        // committed by the tester, so better be conservative.
        const all_keys: string[] = variant_results
            .map((variant) => Object.keys(variant))
            .reduce((p: string[], c: string[]): string[] => [...p, ...c], []);
        // This is a neat trick to remove duplicates!
        const keys: string[] = [...new Set(all_keys)];

        for (const key of keys) {
            // Missing entries are extended to untested; the tester has not started with a full template.
            const all_results: Score[] = variant_results.map((results: TestResults): Score => results[key] || Score.UNTESTED);
            if (all_results.includes(Score.PASS)) {
                retval[key] = Score.PASS;
            } else if (all_results.includes(Score.FAIL)) {
                retval[key] = Score.FAIL
            } else if (all_results.includes(Score.UNTESTED)) {
                retval[key] = Score.UNTESTED
            } else if (all_results.includes(Score.NOT_APPLICABLE)) {
                retval[key] = Score.NOT_APPLICABLE
            }
        }
        return retval;
    };

    // 1. Separate the reports with variants from the "plain" reports
    for (const impl of implementations) {
        if ('variant' in impl) {
            // Collect the variants with a common name
            if (!(impl.name in to_be_consolidated)) {
                to_be_consolidated[impl.name] = [];
            }
            to_be_consolidated[impl.name].push(impl.tests);
        } else {
            final.push(impl);
        }
    }
    // TODO: if there is a ref somewhere, then use that in the output as well

    // 2. consolidate the variants for the same name, and add those to the result
    for (const variant_name in to_be_consolidated) {
        const tests = consolidateTestResults(to_be_consolidated[variant_name]);
        final.push({
            name    : variant_name,
            variant : 'consolidated',
            tests,
        });
    }

    // Re-sort the array to follow the original order
    const retval: ImplementationReport[] = final.sort((a,b) => stringComparison(a.name, b.name));
    return retval;
}


/**
 * Combine the metadata, as retrieved from the tests, and the implementation reports into 
 * one structure for each tests with the test run results included
 * 
 */
function create_implementation_data(metadata: TestData[], implementations: ImplementationReport[]): ImplementationData[] {
    return metadata.map((single_test: TestData): ImplementationData => {
        // Extend the object with, at first, an empty array of implementations
        const retval: ImplementationData = {...single_test, implementations: []};
        retval.implementations = implementations.map((implementor: ImplementationReport) => {
            if (single_test.identifier in implementor.tests) {
                return implementor.tests[single_test.identifier]
            } else {
                return undefined
            }
        }).filter((entry) => entry !== undefined);
        return retval;
    })
}


/**
 * Create Implementation tables: a separate list of implementations for each "section", ie, a collection of tests
 * that share the same `dc:coverage` data
 * 
 */
function createImplementationTables(implementation_data: ImplementationData[]): ImplementationTable[] {
    const retval: ImplementationTable[] = [];

    for (const impl_data of implementation_data) {
        const header = impl_data.coverage;
        let section = retval.find((table) => table.header === header);
        if (section === undefined) {
            section = {
                header          : header,
                implementations : [impl_data],
            }
            retval.push(section)
        } else {
            section.implementations.push(impl_data)
        }
    }

    // Sort the results per section heading
    // Note that this sounds like unnecessary, because, at a later step, the sections are reordered
    // per the configuration file. But this is a safety measure: if the configuration file is
    // not available and/or erroneous, the order is still somewhat deterministic.
    retval.sort((a,b) => stringComparison(a.header, b.header));
    return retval;
}


/* ------------------------------------------------------------------------------------------------------ */
/*                                   External entry points                                                */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Extract all the test information from all available tests.
 * 
 * @param dir_name test directory name
 * @returns EPUB metadata converted into the [[TestData]] structure
 */
// eslint-disable-next-line max-lines-per-function
export async function getTestData(dir_name: string): Promise<TestData[]> {
    // Extract the metadata information from the tests' package file for a single test
    // eslint-disable-next-line max-lines-per-function
    const getSingleTestData = async (file_name: string): Promise<TestData|undefined> => {
        // Note the heavy use of "any" in the function; this is related to the fact that
        // the xmljs package returns a pretty "unpredictable" object...
        // As a consequence, this function bypasses most of TypeScript's checks. Alas!
        const get_string_value = (label: string, fallback: string, metadata: any): string => {
            try {
                const entry = metadata[label][0];
                if (entry === undefined) {
                    return fallback;
                } else {
                    const retval = typeof entry === "string" ? entry : entry._;
                    return retval.trim().replace(/\s+/g, ' ');
                }
            } catch {
                return fallback;
            }
        };

        const getArrayOfStringValues = (label: string, fallback:string, metadata: any): string[] => {
            try {
                const entries = metadata[label];
                if (entries === undefined || entries.length === 0) {
                    return [fallback];
                } else {
                    return entries.map( (entry: any): string => {
                        const retval = typeof entry === "string" ? entry : entry._;
                        return retval.trim().replace(/\s+/g, ' ');
                    });
                }
            } catch {
                return [fallback]
            }
        };

        const getArrayOfMetaValues = (property: string, metadata: any): string[] => {
            return metadata["meta"].filter((entry:any): boolean => entry["$"].property === property)
        }

        const getSingleMetaValue = (property: string, metadata: any): any => {
            return metadata.meta.find((entry: any): boolean => entry["$"].property === property)
        }

        const getRequired = (metadata: any): ReqType => {
            const is_set = getSingleMetaValue("belongs-to-collection", metadata);
            if (is_set === undefined) {
                return "must";
            } else {
                const val: string = (<string>is_set._).toLowerCase();
                switch (val) {
                case "must":
                case "should":
                case "may":
                    return val;
                default:
                    return "must";
                }
            }
        }

        const getFinalTitle = (metadata: any): string => {
            const alternate_title = getSingleMetaValue("dcterms:alternative", metadata);
            return alternate_title === undefined ? get_string_value("dc:title", "(No title)", metadata) : alternate_title._;    
        }

        const getReferenceVersion = (metadata: any): string => {
            const version = getSingleMetaValue("schema:version", metadata);
            return version === undefined ? "3.3" : version._;
        }

        // ---------

        let package_xml: string;
        try {
            package_xml = await get_opf(file_name)
        } catch (error) {
            console.warn(`${error}; skipped.`);
            return undefined;
        }
        const package_js: any = await xml2js.parseStringPromise(package_xml, {
            trim          : true,
            normalizeTags : true,
            explicitArray : true,
        });
        const test_metadata = package_js.package.metadata[0];
        const modification_date = getSingleMetaValue("dcterms:modified", test_metadata);
        const path: string[] = file_name.split('/');
        const identifier = path[path.length - 1];

        if (file_name !== undefined) {
            return {
                identifier  : get_string_value("dc:identifier", identifier, test_metadata),
                title       : getFinalTitle(test_metadata),
                description : get_string_value("dc:description", "(No description)", test_metadata),
                coverage    : get_string_value("dc:coverage", "(Uncategorized)", test_metadata),
                version     : getReferenceVersion(test_metadata),
                creators    : getArrayOfStringValues("dc:creator", "(Unknown)", test_metadata),
                required    : getRequired(test_metadata),
                modified    : modification_date === undefined ? "(Unknown)" : modification_date._,
                references  : getArrayOfMetaValues("dcterms:isReferencedBy", test_metadata).map((entry:any): string => entry._),
            }
        } else {
            console.warn(`File "${file_name}" does not contain a valid package file`);
            return undefined;
        }
    }

    // Get the test descriptions
    const test_list = await getListDir(dir_name, isDirectory);
    const test_data_promises: Promise<TestData|undefined>[] = test_list.map((name: string) => getSingleTestData(`${dir_name}/${name}`));
    
    // Use the 'Promise.all' trick to get to all the data in one async step rather than going through a cycle
    const test_data: (TestData|undefined)[] = await Promise.all(test_data_promises);
    return test_data.filter((entry) => entry !== undefined);
}


/**
 * Get all the test reports and tests files metadata and create the data structures that allow a simple
 * generation of a final report.
 * 
 * @param test_data all the metadata for all tests
 * @param reports directory where the implementation reports reside
 */
export async function getReportData(test_data: TestData[], reports: string): Promise<ReportData> {
    const sort_test_data = (all_tests: TestData[]): TestData[] => {
        const required_tests: TestData[] = [];
        const optional_tests: TestData[] = [];
        const possible_tests: TestData[] = [];

        const get_array = (val: ReqType): TestData[] => {
            switch (val) {
            case "must": return required_tests;
            case "should": return optional_tests;
            case "may": return possible_tests;
            // This is, in fact, not necessary, but typescript is not sophisticated enough to see that...
            // and I hate eslint warnings!
            default: return required_tests;
            }
        }

        for (const test of all_tests) {
            get_array(test.required).push(test);
        }

        // This is, most of the times, unnecessary, because the directory reading has an alphabetic order already.
        // However, in rare cases, the test's file name and the test's identifier may not coincide, and the latter
        // should prevail...
        return [
            ...required_tests.sort((a,b) => stringComparison(a.identifier, b.identifier)),
            ...optional_tests.sort((a,b) => stringComparison(a.identifier, b.identifier)),
            ...possible_tests.sort((a,b) => stringComparison(a.identifier, b.identifier)),
        ]
    }

    // Sort the metadata for all available tests. including the separation of must/should/may tests;
    const metadata: TestData[] = sort_test_data(test_data);

    // Get the list of available implementation reports
    const impl_list: ImplementationReport[] = await getImplementationReports(reports);
    const consolidated_list: ImplementationReport[] = consolidateImplementationReports(impl_list);

    // Combine the two lists to create an array of Implementation data
    const implementation_data: ImplementationData[] = create_implementation_data(metadata, impl_list);
    const consolidated_data: ImplementationData[] = create_implementation_data(metadata, consolidated_list)

    // Section the list of implementation data
    const tables: ImplementationTable[] = createImplementationTables(implementation_data)
    const consolidated_tables: ImplementationTable[] = createImplementationTables(consolidated_data)

    // Create an array of implementers that only contain the bare minimum
    const implementers = impl_list as Implementer[];
    const consolidated_implementers = consolidated_list as Implementer[];

    return {tables, consolidated_tables, implementers, consolidated_implementers}
}

/**
 * Get a list of the tests file names, to be used to generate a template report.
 * 
 * @param report the full report, as generated by earlier calls
 */
export function getTemplate(report: ReportData): Raw_ImplementationReport {
    const test_list: {[index: string]: boolean|null } = {};
    const keys: string[] = [];

    // Get the keys first in order to sort them
    for (const table of report.tables) {
        for (const impl of table.implementations) {
            keys.push(impl.identifier);
        }
    }
    for (const key of keys.sort()) {
        test_list[key] = null;
    }

    return {
        "name"  : "(Implementation's name)",
        "ref"   : "https://www.example.com",
        "tests" : test_list,
    }
}
