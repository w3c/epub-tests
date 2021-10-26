/**
 * Handling configuration data
 * 
 *  @packageDocumentation
 */

import { ReportData, ImplementationTable, Implementer, ImplementationData, Constants, Config } from './types';

import * as fs from "fs";

export function get_config(): Config {
    const config_text = fs.readFileSync(Constants.CONFIG_FILE, 'utf-8');
    return <Config>JSON.parse(config_text);
}

/**
 * If the configuration file sets the `final` value to `false`, all references to the final,`/TR` version of the document must be changed for the editor's draft.
 * 
 * @param config Configuration file
 * @param url incoming URL
 * @returns new URL
 */
export function switch_reference(config: Config, url: string): string {
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
