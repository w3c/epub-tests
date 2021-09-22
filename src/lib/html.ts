/**
 * Generation of the HTML Fragments for the EPUB 3 Testing Reports.
 * 
  * 
 *  @packageDocumentation
 */

/*
The module is based on the JS object format that the [xml2js](https://www.npmjs.com/package/xml2js) package uses
to generate XML from JS easily. Using this module is simpler than either coming up with the XML text through text
concatenations or through the manipulation of a DOM tree using the DOM interface.

Short overview of the format: 

- Each xml element is represented by a JS key;
- If the value is a string then that that is the only textual content;
- If the value is an object, then:
    - the `_` key provides the textual content;
    - the `$` key provides the the attributes through its own JS object;
    - all other keys are considered as sub-elements (or arrays of sub-elements).
- If the value is an array of objects or strings, that represents repeated XML elements.

Due to their fuzzy nature, all this objects are type-annotated as `any`...

*/

import { ReportData, ImplementationTable, Implementer, ImplementationData, Constants } from './types';

import * as xml2js from "xml2js";
const builder = new xml2js.Builder({
    headless : true,
});

/**
 * Turn a text into a string that can be used as an ID
 * @internal
 */
const convert_to_id = (header: string): string => {
    return header.toLowerCase().replace(' ', '-');
}

/* ------------------------------------------------------------------------------------------------------ */
/*                                  List of implementations                                               */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create the list of implementation: a simple set of numbered items, with the name and (possible) reference to the implementation site.
 * @param impl 
 * @returns results in XML format
 */
function create_impl_list(impl: Implementer[]): string {
    const root: any = {
        section : {
            h2 : {
                $ : {
                    id : "sec-implementer-list",
                },                    
                _ : "List of Implementations",
            },
            ol : {
            },
        },
    }

    // The value of li is an array, ie, a repeated set if li elements...
    root.section.ol.li = impl.map((implementer: Implementer): any => {
        // Some implementation reports may not provide a website reference...
        const name = 'variant' in implementer ? `${implementer.name} (${implementer.variant})` : implementer.name;
        if ('ref' in implementer) {
            return {
                a : {
                    $ : {
                        href : implementer.ref,
                    },
                    _ : name,
                },    
            }
        } else {
            return name
        }
    }); 

    // This is where the object is turned into an XML serialization...
    return builder.buildObject(root)
}

/* ------------------------------------------------------------------------------------------------------ */
/*                                       Test result tables                                               */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create one result table: ie, the table with a fixed head and then a series of rows, one for each test.
 * 
 * @param suffix a string to be appended to the ID of a test; used when the same table is displayed with slightly different columns (like for variants)
 * @returns an array of objects to represent the content of the table as JS Objects for a `tr` element in the table
 */
const create_one_result_table = (data: ImplementationTable, implementers: Implementer[], suffix: string = ''): any[] => {
    // The table header is on its own
    const fixed_head = ["Id"];
    const variable_head = implementers.map((impl) => 'variant' in impl ? `${impl.name} &#10;(${impl.variant})` : impl.name);
    const head = [...fixed_head,...variable_head].map((title) => {
        return { th: title }
    });

    const tests = data.implementations.map((row: ImplementationData): any[] => {
        // Creation of one row for a specific test, ie, an array of 'td' elements
        // The row consists of the test (meta)data, and the list of test results

        // Fist the test metadata (currently the ID only); ...
        const test_data = [
            {
                td : {
                    $ : {
                        id : `${row.identifier}-results${suffix}`,
                    },
                    // link to the description of the test in another table...
                    a : {
                        $ : {
                            href : `${Constants.DOC_TEST_DESCRIPTIONS}#${row.identifier}`,
                        },
                        _ : row.identifier,
                    },
                },
            },
        ];

        // ...followed by the test results themselves
        const test_results = row.implementations.map((result) => {
            if (result === undefined) {
                return {td: "n/a"}
            } else {
                const text = result ? Constants.CLASS_PASS : Constants.CLASS_FAIL;
                return {
                    td : {
                        $ : {
                            class : text,
                        },
                        _ : text,
                    },
                }
            }
        })
        // This is one regular row of `td` elements (i.e., the object representations thereof)
        return [...test_data, ...test_results]
    });

    // Combine the two arrays for the full table content
    return [...[head], ...tests];
}

/**
 * Create a series of sections with implementation tables
 * @returns Serialized XML
 */
function create_impl_reports(data: ReportData): string {
    const root1: any = {
        section : {
            h2 : {
                $ : {
                    id : "sec-consolidated-report-tables",
                },
                _ : "Consolidated Implementation Results",
            },
            // ... and one (sub)section for each test category, with its own table
            section : data.consolidated_tables.map((table): any => {
                return {
                    h3 : {
                        $ : {
                            id : `sec-${convert_to_id(table.header)}-results`,
                        },
                        _ : table.header,
                    },

                    // The table itself is created by adding the rows for each test
                    table : {
                        // The zebra class allow for a proper styling of the table
                        $ : {
                            class : "zebra",
                        },
                        // the `colgroup` structure allows styling of the table columns, especially their widths
                        colgroup : {
                            // Only one column is styled; by setting the width we ensure that all tables look identical
                            col : {
                                $ : {
                                    class : Constants.CLASS_COL_ID,
                                },
                            },
                        },
                        // The function returns an array of elements
                        tr : create_one_result_table(table, data.consolidated_implementers),
                    },
                }
            }),
        },
    }

    const root2: any = {
        section : {
            h2 : {
                $ : {
                    id : "sec-detailed-report-tables",
                },
                _ : "Detailed Implementation Results",
            },
            section : data.tables.map((table): any => {
                return {
                    h3 : {
                        $ : {
                            id : `sec-${convert_to_id(table.header)}-results`,
                        },
                        _ : table.header,
                    },

                    // The table itself is created by adding the rows for each test
                    table : {
                        // The zebra class allow for a proper styling of the table
                        $ : {
                            class : "zebra",
                        },
                        // the `colgroup` structure allows styling of the table columns, especially their widths
                        colgroup : {
                            // Only one column is styled; by setting the width we ensure that all tables look identical
                            col : {
                                $ : {
                                    class : Constants.CLASS_COL_ID,
                                },
                            },
                        },
                        // The function returns an array of elements
                        tr : create_one_result_table(table, data.implementers,'-detailed'),
                    },
                }
            }),
        },
    }


    // This is where the object is turned into an XML serialization...
    const the_xml: string = builder.buildObject(root1) + '\n'+ builder.buildObject(root2);
    // Dirty trick: the newline entity is turned into pure text by the builder, changing it manually...
    return the_xml.replace(/&amp;#10;/g, '<br>');
}

/* ------------------------------------------------------------------------------------------------------ */
/*                                      Test description tables                                           */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create one test table: ie, the table with a fixed head and then a series of rows, one for each test.
 * 
 * @returns an array of objects to represent the content of the table as JS Objects for a `tr` element in the table
 */
const create_one_test_table = (data: ImplementationTable): any[] => {

    // The list of specification references must be turned into a series of
    // `a` elements...
    const reference_list = (refs: string[]): any => {
        if (refs.length === 0) {
            return "n.a. ";
        } else {
            let counter = 0;
            return refs.map((ref:string) => {
                counter += 1;
                return {
                    a : {
                        $ : {
                            href : ref,
                        },
                        _ : `(${counter}) `,
                    },
                }
            } )
        }
    }

    // Creation of the header row
    const fixed_head = ["Id", "Title", "Description", "Specs", "Ref"];
    const head = fixed_head.map((title) => { return { th: title} });

    // Creation of an array of regular rows
    const tests = data.implementations.map((row: ImplementationData): any[] => {
        // Creation of one row for a specific test, ie, an array of 'td' elements
        return [
            {
                td : {
                    $ : {
                        id : `${row.identifier}`,
                    },
                    a : {
                        $ : {
                            href : `${Constants.TEST_URL_BASE}/${row.identifier}`,
                        },
                        _ : row.identifier,
                    },
                },
            },
            {
                td : row.title,
            },
            {
                td : row.description,
            },
            {
                td : reference_list(row.references),
            },
            {
                td : {
                    a : {
                        $ : {
                            href : `${Constants.DOC_TEST_RESULTS}#${row.identifier}-results`,
                        },
                        _ : "❐",
                    },
                },
            },
        ];
    });

    // Combine the two for the full table content
    return [...[head], ...tests];
}

/**
 * Create the test (meta) data table
 * @param data 
 * @returns Serialized XML
 */
function create_test_data(data: ReportData): string {
    const root: any = {
        // It is all a big section...
        section : {
            // ... with a header
            h2 : {
                $ : {
                    id : "sec-test-tables",
                },
                _ : "Description of the Tests",
            },

            // ... and one (sub)section for each test category, with its own table
            section : data.tables.map((table): any => {
                return {
                    h2 : {
                        $ : {
                            id : `sec-${convert_to_id(table.header)}-data`,
                        },
                        _ : table.header,
                    },

                    // The table itself is created by adding the rows for each test
                    table : {
                        // The zebra class allow for a proper styling of the table
                        $ : {
                            class : "zebra",
                        },
                        // the `colgroup` structure allows styling of the table columns, especially their widths
                        colgroup : {
                            col : [
                                {
                                    $ : {
                                        class : Constants.CLASS_COL_ID,
                                    },
                                },
                                {
                                    $ : {
                                        class : Constants.CLASS_COL_TITLE,
                                    },
                                },
                                {},
                                {
                                    $ : {
                                        class : Constants.CLASS_COL_SREF,
                                    },
 
                                },
                                {
                                    $ : {
                                        class : Constants.CLASS_COL_TREF,
                                    },
                                },
                            ],
                        },
                        tr : create_one_test_table(table),
                    },
                }
            }),
        },
    };

    // This is where the object is turned into an XML serialization...
    return builder.buildObject(root);
}

/* ------------------------------------------------------------------------------------------------------ */
/*                                   External entry point                                                 */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create three HTML fragments, to be stored in separate files. Each is in a `<section>` with a subtitle, prepared for respec
 * 
 * 1. A bulleted list of available implementations, linked (if available) to the Web Site of the implementation itself
 * 2. A series of subsections, each with its own table; each table row is a reference to the test and a series of cells (one per implementation) whether the test passes or not. This structure comes twice: one for consolidated results, and one for the
 * original ones
 * 3. A series of subsections, each with its own table; each table row contains basic metadata and cross references to the tests.
 * 
 * The return for each of those is in the form of a string containing the XHTML fragment
 * 
 */
export function create_report(data: ReportData): {implementations: string, results: string, tests: string} {
    return {
        implementations : create_impl_list(data.implementers),
        results         : create_impl_reports(data),
        tests           : create_test_data(data),
    }
}

