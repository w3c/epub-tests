/**
 * Handling configuration data
 * 
 *  @packageDocumentation
 */

import { ImplementationTable, Constants, ReportData } from './types';
import * as fs from "fs";

/**
 * External configuration type
 */
interface Config {
    final: boolean;
    coverage_labels: string[];
    document_mappings: { from: string; to: string}[];
}

/**
 * If the configuration file sets the `final` value to `false`, all references to the final,`/TR` version of the document must be changed for the editor's draft. This function changes those references.
 * 
 * @param config Configuration file
 * @param table reference to all the tests (as part of the implementation table)
 * @returns new URL
 */
function change_references(config: Config, table: ImplementationTable[]): ImplementationTable[] {
    const change_doc_references = (url: string): string => {
        if (config.final === false) {
            for (const mapping of config.document_mappings) {
                if (url.startsWith(mapping.from)) {
                    return url.replace(mapping.from, mapping.to);
                }
            }
            return url;
        } else {
            return url;
        }
    }

    for (const implementation_table of table) {
        for (const implementation_data of implementation_table.implementations) {
            implementation_data.references = implementation_data.references.map(change_doc_references);
        }
    }
    return table;
}


/**
 * The implementation table array is sorted using the `header` member as a key, and following the order of the coverage labels
 * in the configuration. If an Implementation Table `header` is not in the configuration's coverage labels, it is relegated to the
 * end of the array.
 * 
 * @param config Configuration data
 * @param table Properly sorted table
 * @returns 
 */
function order_implementation_table(config: Config, table: ImplementationTable[]): ImplementationTable[] {
    const simple_sort = (left: number|string, right: number|string): number => {
        if (left < right) return -1;
        else if (left > right) return 1;
        else return 0;
    };

    // 1. Separate the tables into two: the ones whose header is mentioned in the configuration object and the rest
    const mentioned: ImplementationTable[] = table.filter((entry: ImplementationTable): boolean => {
        return config.coverage_labels.includes(entry.header);
    });
    const not_mentioned: ImplementationTable[] = table.filter((entry: ImplementationTable): boolean => {
        return !config.coverage_labels.includes(entry.header);
    });

    //2. The first table should be sorted based on the order in the configuration
    const final_mentioned =  mentioned.sort((left: ImplementationTable, right: ImplementationTable): number => {
        const left_index = config.coverage_labels.indexOf(left.header);
        const right_index = config.coverage_labels.indexOf(right.header);
        return simple_sort(left_index, right_index);
    });

    //3. The second table should be sorted by a simple string order
    const final_not_mentioned = not_mentioned.sort((left: ImplementationTable, right: ImplementationTable): number => {
        return simple_sort(left.header, right.header);
    });

    return [...final_mentioned, ...final_not_mentioned];
}

/**
 * Apply the configuration actions on the report before it is used to generate HTML files.
 * 
 * At present this means:
 * 
 * 1. Update the document references to the editor's drafts if the report is not final
 * 2. Use the order of sections listed in the configuration for the generated tables
 * 
 * @param report 
 * @returns 
 */
export function apply_configuration_options(report: ReportData): ReportData {
    try {
        // 1. Get the configuration file. If there are issues, just return the original data, unchanged.
        const config_text = fs.readFileSync(Constants.CONFIG_FILE, 'utf-8');
        const config: Config = <Config>JSON.parse(config_text); 

        // 2. get the document references right
        change_references(config, report.tables);

        // 3. sort the implementation tables
        const tables = order_implementation_table(config, report.tables);
        const consolidated_tables = order_implementation_table(config, report.consolidated_tables);

        return {
            tables,
            consolidated_tables,
            implementers              : report.implementers,
            consolidated_implementers : report.consolidated_implementers,
        }
    } catch (error) {
        console.log(error);
        return report;
    }
}
