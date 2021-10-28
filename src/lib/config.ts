/**
 * Handling configuration data
 * 
 *  @packageDocumentation
 */

import { ImplementationTable, Constants, Config } from './types';

import * as fs from "fs";

/**
 * Read the configuration JSON file and convert it into the configuration object.
 * 
 * @returns the configuration file content.
 */
export function get_config(): Config {
    try {
        const config_text = fs.readFileSync(Constants.CONFIG_FILE, 'utf-8');
        return <Config>JSON.parse(config_text);    
    } catch (error) {
        console.error("Warning! The configuration file does not exist or is incorrect!")
        return {
            final             : true,
            coverage_labels   : [],
            document_mappings : [],
        }
    }
}

/**
 * If the configuration file sets the `final` value to `false`, all references to the final,`/TR` version of the document must be changed for the editor's draft. This function changes those references.
 * 
 * @param config Configuration file
 * @param url incoming URL
 * @returns new URL
 */
export function change_doc_references(config: Config, url: string): string {
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

/**
 * The implementation table array is sorted using the `header` member as a key, and following the order of the coverage labels
 * in the configuration. If an Implementation Table `header` is not in the configuration's coverage labels, it is relegated to the
 * end of the array.
 * 
 * @param config Configuration data
 * @param table Properly sorted table
 * @returns 
 */
export function order_implementation_table(config: Config, table: ImplementationTable[]): ImplementationTable[] {
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
