"use strict";
/**
 * Module to extract and gather information necessary to produce the right reports and an overview page for test cases.
 *
 * Note: the term "consolidation" is used, throughout this module, for the following situation.
 * Some implementations may come in different variants:
 * the same name (typically designating the core engine) but a separate versions ("variants")
 * for different environments, typically iOS, Android, or Web.
 * Per W3C these are not considered to be independent implementations and, therefore,
 * they should be considered as one implementation as far as the
 * formal CR report is concerned. On the other hand, there is value to keep the various implementation results separated.
 *
 * To keep this, the report generator (and the display of the results) "duplicates" the list of
 * implementations: one is the original (ie, with variants kept separated) and
 * one where the result of all the variants are "consolidated" into a unique implementation report.
 * The duplication of these data is then reflected in the way the reports are displayed.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_template = exports.get_report_data = void 0;
const fs_old_school = require("fs");
const fs = fs_old_school.promises;
const xml2js = require("xml2js");
const types_1 = require("./types");
/**
 * Name tells it all...
 *
 * @internal
 */
function string_comparison(a, b) {
    if (a < b)
        return -1;
    else if (a > b)
        return 1;
    else
        return 0;
}
/**
 * See if a file name path refers to a real file
 *
 * @internal
 */
function isDirectory(name) {
    return fs_old_school.lstatSync(name).isDirectory();
}
/**
 * See if a file name path refers to a real file
 *
 * @internal
 */
function isFile(name) {
    return fs_old_school.lstatSync(name).isFile();
}
/**
 * Lists of a directory content.
 *
 * (Note: at this moment this returns all the file names. Depending on the final configuration some filters may have to be added.)
 *
 * @param dir_name name of the directory
 * @param filter_name a function to filter the retrieved list (e.g., no directories)
 * @returns lists of files in the directory
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function get_list_dir(dir_name, filter_name = (name) => true) {
    // The filter works on the full path, hence this extra layer
    const file_name_filter = (name) => {
        return name.startsWith('xx-') === false && filter_name(`${dir_name}/${name}`);
    };
    const file_names = await fs.readdir(dir_name);
    return file_names.filter(file_name_filter);
}
/**
 * Get all the implementation reports from the file system.
 * The results are sorted using the implementation's name as a key.
 *
 * @param dir_name the directory that contains the implementation reports
 */
async function get_implementation_reports(dir_name) {
    // Get a single implementation report, which must be a JSON file
    const get_implementation_report = async (file_name) => {
        const implementation_report = await fs.readFile(file_name, 'utf-8');
        return JSON.parse(implementation_report);
    };
    const implementation_list = await get_list_dir(dir_name, isFile);
    // Use the 'Promise.all' trick to get to all the implementation reports in one async step rather than going through a cycle
    const report_list_promises = implementation_list.map((file_name) => get_implementation_report(`${dir_name}/${file_name}`));
    const implementation_reports = await Promise.all(report_list_promises);
    implementation_reports.sort((a, b) => string_comparison(a.name, b.name));
    return implementation_reports;
}
/**
 * Create consolidated implementation reports.
 *
 * Some implementation report appear several times as 'variants' (typically android, ios, or web). These
 * are usually using the same engine, so their results should be merged into one for the purpose of a formal
 * report for the AC.
 *
 * @param implementations the original list of implementations
 * @returns a consolidated list of the implementation reports
 */
function consolidate_implementation_reports(implementations) {
    const final = [];
    const to_be_consolidated = {};
    // This is the real meat: creat a new set of test results combining the test result of the variants.
    // The problem is that different variants may skip some tests, i.e., the
    // final list of test names must be the union of all the tests in the different variants
    const consolidate_test_results = (variant_results) => {
        const retval = {};
        // Get all keys together
        const all_keys = variant_results
            .map((variant) => Object.keys(variant))
            .reduce((p, c) => [...p, ...c], []);
        // This is a neat trick to remove duplicates!
        const keys = [...new Set(all_keys)];
        // Next is to merge all the results. The rule is to set the result to 'true' if at least one of the values is 'true'
        for (const key of keys) {
            // Minor side effect trick: for each key there is at least one Test Result that has a value. We can therefore
            // safely set the result to 'false' temporarily if the test result is not available; there must be a false or true
            // value somewhere else in the array anyway.
            const all_results = variant_results.map((results) => key in results ? results[key] : false);
            retval[key] = all_results.reduce((p, c) => p || c, false);
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
        }
        else {
            final.push(impl);
        }
    }
    // TODO: if there is a ref somewhere, then use that in the output as well
    // 2. consolidate the variants for the same name, and add those to the result
    for (const variant_name in to_be_consolidated) {
        const tests = consolidate_test_results(to_be_consolidated[variant_name]);
        final.push({
            name: variant_name,
            variant: 'consolidated',
            tests,
        });
    }
    // Re-sort the array to follow the original order
    const retval = final.sort((a, b) => string_comparison(a.name, b.name));
    return retval;
}
/**
 * Extract all the test information from all available tests.
 *
 * @param dir_name test directory name
 * @returns EPUB metadata converted into the [[TestData]] structure
 */
async function get_test_metadata(dir_name) {
    // Extract the metadata information from the tests' package file for a single test
    const get_single_test_metadata = async (file_name) => {
        const get_string_value = (label, fallback) => {
            try {
                const entry = metadata[label][0];
                if (entry === undefined) {
                    return fallback;
                }
                else {
                    return typeof entry === "string" ? entry : entry._;
                }
            }
            catch {
                return fallback;
            }
        };
        const package_xml = await fs.readFile(`${file_name}/${types_1.Constants.OPF_FILE}`, 'utf-8');
        const package_js = await xml2js.parseStringPromise(package_xml, {
            trim: true,
            normalizeTags: true,
            explicitArray: true,
        });
        const metadata = package_js.package.metadata[0];
        const alternate_title = metadata.meta.find((entry) => entry["$"].property === "dcterms:alternative");
        const final_title = alternate_title === undefined ? get_string_value("dc:title", "(No title)") : alternate_title._;
        return {
            identifier: get_string_value("dc:identifier", file_name.split('/').pop()),
            title: final_title,
            description: get_string_value("dc:description", "(No description)"),
            coverage: get_string_value("dc:coverage", "(Uncategorized)"),
            references: metadata["meta"].filter((entry) => entry["$"].property === "dcterms:isReferencedBy").map((entry) => entry._),
        };
    };
    // Get the test descriptions
    const test_list = await get_list_dir(dir_name, isDirectory);
    const test_data_promises = test_list.map((name) => get_single_test_metadata(`${dir_name}/${name}`));
    // Use the 'Promise.all' trick to get to all the data in one async step rather than going through a cycle
    return await Promise.all(test_data_promises);
}
/**
 * Combine the metadata, as retrieved from the tests, and the implementation reports into
 * one structure for each tests with the test run results included
 *
 */
function create_implementation_data(metadata, implementations) {
    return metadata.map((single_test) => {
        // Extend the object with, at first, an empty array of implementations
        const retval = { ...single_test, implementations: [] };
        retval.implementations = implementations.map((implementor) => {
            if (single_test.identifier in implementor.tests) {
                return implementor.tests[single_test.identifier];
            }
            else {
                return undefined;
            }
        });
        return retval;
    });
}
/**
 * Create Implementation tables: a separate list of implementations for each "section", ie, a collection of tests
 * that share the same `dc:coverage` data
 *
 */
function create_implementation_tables(implementation_data) {
    const retval = [];
    for (const impl_data of implementation_data) {
        const header = impl_data.coverage;
        let section = retval.find((table) => table.header === header);
        if (section === undefined) {
            section = {
                header: header,
                implementations: [impl_data],
            };
            retval.push(section);
        }
        else {
            section.implementations.push(impl_data);
        }
    }
    // Sort the results per section heading
    retval.sort((a, b) => string_comparison(a.header, b.header));
    return retval;
}
/* ------------------------------------------------------------------------------------------------------ */
/*                                   External entry points                                                */
/* ------------------------------------------------------------------------------------------------------ */
/**
 * Get all the test reports and tests files metadata and create the data structures that allow a simple
 * generation of a final report
 *
 * @param tests directory where the tests reside
 * @param reports directory where the implementation reports reside
 */
async function get_report_data(tests, reports) {
    // Get the metadata for all available tests;
    const metadata = await get_test_metadata(tests);
    // Get the list of available implementation reports
    const impl_list = await get_implementation_reports(reports);
    const consolidated_list = consolidate_implementation_reports(impl_list);
    // Combine the two lists to create an array of Implementation data
    const implementation_data = create_implementation_data(metadata, impl_list);
    const consolidated_data = create_implementation_data(metadata, consolidated_list);
    // Section the list of implementation data
    const tables = create_implementation_tables(implementation_data);
    const consolidated_tables = create_implementation_tables(consolidated_data);
    // Create an array of implementers that only contain the bare minimum
    const implementers = impl_list;
    const consolidated_implementers = consolidated_list;
    return { tables, consolidated_tables, implementers, consolidated_implementers };
}
exports.get_report_data = get_report_data;
/**
 * Get a list of the tests file names, to be used to generate a template report.
 *
 * @param report the full report, as generated by earlier calls
 */
function get_template(report) {
    const test_list = {};
    for (const table of report.tables) {
        for (const impl of table.implementations) {
            test_list[impl.identifier] = false;
        }
    }
    return {
        "name": "(Implementation's name)",
        "ref": "https://www.example.com",
        "tests": test_list,
    };
}
exports.get_template = get_template;
//# sourceMappingURL=data.js.map