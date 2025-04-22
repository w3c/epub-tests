/**
 * Generation of the HTML Fragments for the EPUB 3 Testing Reports.
 * 
 *  @license [W3C Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software) 
 *  @packageDocumentation
 */

import { ReportData, Implementer, Constants, Score, HTMLFragments } from './types.ts';
import { JSDOM }                                                    from 'npm:jsdom';

/**
 * Turn a text into a string that can be used as an ID
 * @internal
 */
const convertToID = (header: string): string => {
    return header.toLowerCase().replace(' ', '-');
}

/**
 * Add a new HTML Element to a parent, and return the new element
 * 
 * @param parent The parent HTML Element
 * @param element The new element's name
 * @param content The new element's (HTML) content
 * @returns 
 * 
 * @internal
 */
const addChild = (parent: HTMLElement, element: string, content: string|undefined = undefined): HTMLElement => {
    const new_element = parent.ownerDocument.createElement(element);
    parent.appendChild(new_element);
    if (content !== undefined) new_element.innerHTML = content;
    return new_element;
}

/* ------------------------------------------------------------------------------------------------------ */
/*                                  List of implementations                                               */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create the list of implementation: a simple set of numbered items, with the name 
 * and (possible) reference to the implementation's web site.
 * 
 * @param impl 
 * @returns results in XML format
 */
function createImplementationList(impl: Implementer[]): string {
    const dom: DocumentFragment = JSDOM.fragment('<section id="sec-implementer-list"><h2>List of Implementations</h2></section>');
    const section: HTMLElement|null = dom.querySelector('section');

    if (section === null) {
        // In fact, this never happens, because we run the query on the string itself. But a TS compiler 
        // does not realize that
        throw new Error('Unable to create the implementation list: no section element found');
    }

    const ol = addChild(section, 'ol');

    for (const implementer of impl) {
        const li = addChild(ol, 'li');
        const name = 'ref' in implementer ? `<a href="${implementer.ref}">${implementer.name}</a>` : `${implementer.name}`;
        li.innerHTML = 'variant' in implementer ? `${name}, ${implementer.variant}` : name;
    }
    // This returns, in effect, the XML serialization of the section
    return section.outerHTML;
}

/* ------------------------------------------------------------------------------------------------------ */
/*                                       Test result tables                                               */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create a series of sections with implementation tables; this includes separating the block of
 * "consolidated" data from the "variant" versions.
 * @returns Serialized XML for an HTML fragment
 */
// eslint-disable-next-line max-lines-per-function
function createImplementationReports(data: ReportData): {consolidated_results: string, complete_results: string} {
    // Two tables must be created: the consolidated and detailed results. The function below is 
    // invoked twice to get these two separately.
    const createImplReport = (consolidated: boolean): string => {
        // The whole content is enclosed in a large, top level section
        const title = consolidated ? 'Consolidated Implementation Results' : 'Detailed Implementation Results';
        const id = consolidated ? 'sec-consolidated-report-tables' : 'sec-detailed-report-tables';
        // This is used when generating a table row id, to distinguish between the two variants.
        const suffix: string = consolidated ? '' : '-detailed';

        // This is the top level for the HTML fragment to be returned (serialized) at the end.
        const dom: DocumentFragment = JSDOM.fragment(`<section id="${id}"><h2>${title}</h2></section>`);
        const top_section: HTMLElement|null = dom.querySelector('section');

        if (top_section === null) {
            // In fact, this never happens, because we run the query on the string itself so we know the
            // result. But a TS compiler does not realize that and we want to keep it happy.
            throw new Error('Unable to create the implementation report: no section element found in result tables');
        }

        // Going through the implementation table entries; 
        // Each table corresponds to one 'category' (Core Media Types, Internationalizations, Fixed Layouts, etc.)
        for (const table of (consolidated ? data.consolidated_tables : data.tables)) {
            // Each table is enclosed in a separate subsection
            const table_section = addChild(top_section, 'section');

            const h3 = addChild(table_section, 'h3', table.header);
            h3.id = (consolidated) ? `sec-consolidated-${convertToID(table.header)}-results` : `sec-detailed-${convertToID(table.header)}-results`;

            if (consolidated && Constants.OPTIONAL_FEATURES.includes(table.header)) {
                const p = addChild(table_section,'p','The general feature is <em>OPTIONAL;</em> a "must" tests means that <em>it is required to pass it to claim conformance in implementing the feature</em>.');
                table_section.className = "optional_feature";
            }

            const test_table = addChild(table_section, 'table');
            test_table.className = 'zebra';

            addChild(test_table, 'colgroup', `
                <col class="${Constants.CLASS_COL_ID}"/>
                <col class="${Constants.CLASS_COL_REQ}"/>
            `);

            // Header rows for each implementation
            const thead = addChild(test_table, 'thead');
            const header_row = addChild(thead, 'tr');
            addChild(header_row, 'th', 'Id');
            addChild(header_row, 'th', 'Req');
            for (const impl of (consolidated ? data.consolidated_implementers : data.implementers)) {
                let head: string;
                if (impl.variant !== undefined) {
                    head = impl.variant !== 'consolidated' ? `${impl.name}<br />${impl.variant}` : impl.name;
                } else {
                    head = `${impl.name}`;
                }
                addChild(header_row, 'th', head);
            }

            const tbody = addChild(test_table, 'tbody');
            // A cycle for each table row:
            for (const row of table.implementations) {
                const tr = addChild(tbody, 'tr'); 

                // First the fixed table cells...
                const td_id = addChild(tr, 'td', `<a href="${Constants.DOC_TEST_DESCRIPTIONS}#${row.identifier}">${row.identifier}</a>`);
                td_id.id = `${row.identifier}-results${suffix}`;
                td_id.className = row.required;

                addChild(tr, 'td', row.required);

                //... followed by the test results themselves
                let passes = 0;
                for (const result of row.implementations) {
                    if (result === undefined) {
                        // This may happen if the tester has not started with a full template...
                        const td_impl = addChild(tr, 'td', 'todo');
                        td_impl.className = Constants.CLASS_UNTESTED;                        
                    } else {
                        const td_impl = addChild(tr, 'td', Score.get_td(result));
                        td_impl.className = Score.get_class(result)
                        if (Score.get_td(result) === Score.PASS) {
                            passes += 1;
                        }
                    }
                }
                if (consolidated && row.required === "must" && passes < 2) {
                    tr.className = "under_implemented";
                }
            }
        }
        return top_section.outerHTML;
    }

    return {
        consolidated_results : createImplReport(true),
        complete_results     : createImplReport(false),
    };
}


/* ------------------------------------------------------------------------------------------------------ */
/*                                      Test description tables                                           */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create the test (meta) data table.
 * 
 * @param data 
 * @returns Serialized XML for an HTML fragment
 */
function createTestData(data: ReportData): string {
    // Add the button to switch the visibility of should/may tests on and off
    const addVisibilityButton = (parent: HTMLElement): void => {
        const div = addChild(parent, "div");
        div.id = "button_container";
        const button = addChild(div, "button", "Switch visibility");
        button.id = "should_may_visibility"
        button.setAttribute("type", "button");
    };
    
    const dom: DocumentFragment = JSDOM.fragment('<section id="sec-test-tables"><h2>Description of the Tests</h2></section>');
    const full_section: HTMLElement|null = dom.querySelector('section');

    if (full_section === null) {
        // In fact, this never happens, because we run the query on the string itself. But a TS compiler 
        // does not realize that and we want to keep it happy.
        throw new Error('Unable to create the test data section: no section element found');
    }

    // Add the visibility switch button
    addVisibilityButton(full_section);

    for (const table of data.tables) {
        // Each table is enclosed in a separate subsection
        const table_section = addChild(full_section, 'section');

        const h3 = addChild(table_section, 'h3', table.header);
        h3.id = `sec-${convertToID(table.header)}-data`;

        const test_table = addChild(table_section, 'table');
        test_table.className = 'zebra sortable';

        const thead = addChild(test_table, 'thead');
        // Next is a header row
        addChild(thead, 'tr',`
            <th scope="col" class="order-asc" style="width:17%">Id</th>
            <th scope="col" style="width:57%">Description</th>
            <th scope="col" style="width:8%">Req</th>
            <th scope="col" class="order-asc" style="width:4%">Version</th>
            <th scope="col" style="width:6%">Date</th>
            <th scope="col" data-nonsortable="true" style="width:4%">Specs</th>
            <th scope="col" data-nonsortable="true" style="width:4%">Ref</th>
        `);

        const tbody = addChild(test_table, 'tbody');
        // Finally, a row per test
        for (const row of table.implementations) {
            const tr = addChild(tbody, 'tr');

            // a bunch of table cells...
            const td_id = addChild(tr, 'td', `<a href="${Constants.TEST_URL_BASE}/${row.identifier}">${row.identifier}</a>`);
            td_id.className = row.required;
            td_id.id = `${row.identifier}`;

            addChild(tr, 'td', row.description);
            addChild(tr, 'td', row.required);
            addChild(tr, 'td', row.version);

            const date: string[] = row.modified.split('T')[0].split('-');
            date[0] = `’${date[0].charAt(2)}${date[0].charAt(3)}`;
            addChild(tr, 'td', date.join('.'));


            const td_specs = addChild(tr, 'td');
            if (row.references.length === 0) {
                td_specs.innerHTML = 'n.a. ';
            } else {
                let counter = 0;
                for (const ref of row.references) {
                    counter += 1;
                    const a = addChild(td_specs, 'a', ` (${counter})`);
                    a.setAttribute('href', ref);
                }
            }
            addChild(tr, 'td', `<a href="${Constants.DOC_TEST_RESULTS}#${row.identifier}-results">☞</a>`); /* ❐ */
        }
    }

    // This is where the object is turned into an XML serialization...
    return full_section.outerHTML;
}

/* ------------------------------------------------------------------------------------------------------ */
/*                                             Creators                                                   */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create an HTML unnumbered list with the creators of the tests. The names are sorted alphabetically.
 * 
 * @param data 
 * @returns Serialized XML for the creators' list.
 */
function createCreatorList(data: ReportData): string {
    const creators: Set<string> = new Set<string>();
    const dom: DocumentFragment = JSDOM.fragment('<ul></ul>');
    const ul: HTMLElement|null = dom.querySelector('ul');

    if (ul === null) {
        // In fact, this never happens, because we run the query on the string itself. But a TS compiler 
        // does not realize that and we want to keep it happy.s
        throw new Error('Unable to create the creator list: no ul element found');
    }

    // Collect all creators into a set (to avoid duplicates)
    // Some (fake) creators should not be added; these are tests that test the id values...
    // Also, mistakes happen, and tests may not have a creator assigned, those should be filtered out, too
    for (const table of data.tables) {
        for (const test of table.implementations) {
            if (!Constants.IGNORE_CREATOR_ID.includes(test.identifier)) {
                for (const creator of test.creators) {
                    if (!Constants.IGNORE_CREATORS.includes(creator)) {
                        creators.add(creator)
                    }
                } 
            }
        }
    }

    for (const creator of [...creators].sort()) {
        addChild(ul, 'li', creator);
    }

    return ul.outerHTML;
}



/* ------------------------------------------------------------------------------------------------------ */
/*                                   External entry point                                                 */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create four HTML fragments, to be stored, eventually, in separate files. 
 * Each is in a `<section>` with a subtitle, except for the last one that is simply an HTML `<ul>` list. 
 * These fragments can be included in the final report using the `data-include` feature of respec:
 * 
 * 1. A bulleted list of available implementations, linked (if available) to the Web site of the implementation itself
 * 2. A series of subsections, each with its own table; each table row is a reference to the test and a series of cells (one per implementation) whether the test passes or not. This structure comes twice: one for consolidated results, and one for the original ones
 * 3. A series of subsections, each with its own table; each table row contains basic metadata and cross references to the tests.
 * 4. A list of test creators
 * 
 * The return for each of those is in the form of a string containing the XHTML fragment.
 * 
 */
export function createReport(data: ReportData): HTMLFragments {
    const {consolidated_results, complete_results} = createImplementationReports(data);
    return {
        implementations : createImplementationList(data.implementers),
        consolidated_results,
        complete_results,
        tests           : createTestData(data),
        creators        : createCreatorList(data),
    }
}

