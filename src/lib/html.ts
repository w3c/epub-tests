/**
 * Generation of the HTML Fragments for the EPUB 3 Testing Reports.
 * 
  * 
 *  @packageDocumentation
 */

import { ReportData, Implementer, Constants } from './types';
import { JSDOM } from "jsdom";

/**
 * Turn a text into a string that can be used as an ID
 * @internal
 */
const convert_to_id = (header: string): string => {
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
const add_child = (parent: HTMLElement, element: string, content: string = undefined): HTMLElement => {
    const new_element = parent.ownerDocument.createElement(element);
    parent.appendChild(new_element);
    if (content !== undefined) new_element.innerHTML = content;
    return new_element;
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
    const dom: DocumentFragment = JSDOM.fragment('<section id="sec-implementer-list"><h2>List of Implementations</h2></section>');
    const section: HTMLElement = dom.querySelector('section');

    const ol = add_child(section, 'ol');

    for (const implementer of impl) {
        const li = add_child(ol, 'li');
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
 * @returns Serialized XML
 */
// eslint-disable-next-line max-lines-per-function
function create_impl_reports(data: ReportData): string {
    // Two tables must be created: the consolidated and detailed results. The function below is 
    // invoked twice to get these two.
    const create_impl_report = (consolidated: boolean): string => {
        // The whole content is enclosed in a large, top level section
        const title = consolidated ? 'Consolidated Implementation Results' : 'Detailed Implementation Results';
        const id = consolidated ? 'sec-consolidated-report-tables' : 'sec-detailed-report-tables';
        const suffix: string = consolidated ? '' : '-detailed'

        const dom: DocumentFragment = JSDOM.fragment(`<section id="${id}"><h2>${title}</h2></section>`);
        const top_section: HTMLElement = dom.querySelector('section');

        // Going through the implementation table entries; 
        // Each table corresponds to one 'category' (Core Media Types, Internationalizations, Fixed Layouts, etc.)
        for (const table of (consolidated ? data.consolidated_tables : data.tables)) {
            // Each table is enclosed in a separate subsection
            const table_section = add_child(top_section, 'section');

            const h3 = add_child(table_section, 'h3', table.header);
            h3.id = `sec-${convert_to_id(table.header)}-results`;

            const test_table = add_child(table_section, 'table');
            test_table.className = 'simple';

            add_child(test_table, 'colgroup', `
                <col class="${Constants.CLASS_COL_ID}"/>
                <col class="${Constants.CLASS_COL_REQ}"/>
            `);

            // Header rows for each implementation
            const thead = add_child(test_table, 'thead');
            const header_row = add_child(thead, 'tr');
            add_child(header_row, 'th', 'Id');
            add_child(header_row, 'th', 'Req');
            for (const impl of (consolidated ? data.consolidated_implementers : data.implementers)) {
                let head: string;
                if (impl.variant !== undefined) {
                    head = impl.variant !== 'consolidated' ? `${impl.name}<br />${impl.variant}` : impl.name;
                } else {
                    head = `${impl.name}`;
                }
                add_child(header_row, 'th', head);
            }

            const tbody = add_child(test_table, 'tbody');
            // A cycle for each table row:
            for (const row of table.implementations) {
                const tr = add_child(tbody, 'tr'); 

                // First the fixed table cells...
                const td_id = add_child(tr, 'td', `<a href="${Constants.DOC_TEST_DESCRIPTIONS}#${row.identifier}">${row.identifier}</a>`);
                td_id.id = `${row.identifier}-results${suffix}`;
                td_id.className = row.required;

                add_child(tr, 'td', row.required);

                //... followed by the test results themselves
                for (const result of row.implementations) {
                    if (result === undefined) {
                        add_child(tr, 'td', 'n/a');
                    } else {
                        const text = result ? Constants.CLASS_PASS : Constants.CLASS_FAIL
                        const td_impl = add_child(tr, 'td', text);
                        td_impl.className = text
                    }
                }
            }
        }
        return top_section.outerHTML;
    }

    return `
    ${create_impl_report(true)}

    ${create_impl_report(false)}
    `;
}


/* ------------------------------------------------------------------------------------------------------ */
/*                                      Test description tables                                           */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create the test (meta) data table.
 * @param data 
 * @returns Serialized XML
 */
function create_test_data(data: ReportData): string {
    // Add the button to switch the visibility of should/may tests on and off
    const add_visibility_button = (parent: HTMLElement): void => {
        const div = add_child(parent, "div");
        div.id = "button_container";
        const button = add_child(div, "button", "Switch visibility");
        button.id = "should_may_visibility"
        button.setAttribute("type", "button");
    };
    
    const dom: DocumentFragment = JSDOM.fragment('<section id="sec-test-tables"><h2>Description of the Tests</h2></section>');
    const full_section: HTMLElement = dom.querySelector('section');

    // Add the visibility switch button
    add_visibility_button(full_section);

    for (const table of data.tables) {
        // Each table is enclosed in a separate subsection
        const table_section = add_child(full_section, 'section');

        const h3 = add_child(table_section, 'h3', table.header);
        h3.id = `sec-${convert_to_id(table.header)}-data`;

        const test_table = add_child(table_section, 'table');
        test_table.className = 'simple sortable';

        // The table begins with a colgroup to allow for a proper styling, 
        // especially a common width for all columns across the document
        // add_child(test_table, 'colgroup',`
        //     <col class="${Constants.CLASS_COL_ID}"/>
        //     <col class="${Constants.CLASS_COL_REQ}"/>
        //     <col class="${Constants.CLASS_COL_TITLE}"/>
        //     <col class="${Constants.CLASS_COL_DESCR}"/>
        //     <col class="${Constants.CLASS_COL_MOD}"/>
        //     <col class="${Constants.CLASS_COL_SREF}"/>
        //     <col class="${Constants.CLASS_COL_TREF}"/>
        // `);

        const thead = add_child(test_table, 'thead');
        // Next is a header row
        add_child(thead, 'tr',`
            <th scope="col" class="order-asc" style="width:12%">Id</th>
            <th scope="col" style="width:8%">Req</th>
            <th scope="col" style="width:20%">Title</th>
            <th scope="col" style="width:44%">Description</th>
            <th scope="col" style="width:8%">Date</th>
            <th scope="col" data-nonsortable="true" style="width:4%">Specs</th>
            <th scope="col" data-nonsortable="true" style="width:4%">Ref</th>
        `);

        const tbody = add_child(test_table, 'tbody');
        // Finally, a row per test
        for (const row of table.implementations) {
            const tr = add_child(tbody, 'tr');

            // a bunch of table cells...
            const td_id = add_child(tr, 'td', `<a href="${Constants.TEST_URL_BASE}/${row.identifier}">${row.identifier}</a>`);
            td_id.className = row.required;
            td_id.id = `${row.identifier}`;

            add_child(tr, 'td', row.required);
            add_child(tr, 'td', row.title); 
            add_child(tr, 'td', row.description);

            const date: string[] = row.modified.split('T')[0].split('-');
            date[0] = `’${date[0].charAt(2)}${date[0].charAt(3)}`;
            add_child(tr, 'td', date.join('.'));

            const td_specs = add_child(tr, 'td');
            if (row.references.length === 0) {
                td_specs.innerHTML = 'n.a. ';
            } else {
                let counter = 0;
                for (const ref of row.references) {
                    counter += 1;
                    const a = add_child(td_specs, 'a', ` (${counter})`);
                    a.setAttribute('href', ref);
                }
            }
            add_child(tr, 'td', `<a href="${Constants.DOC_TEST_RESULTS}#${row.identifier}-results">❐</a>`);
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
function create_creator_list(data: ReportData): string {
    const creators: Set<string> = new Set<string>();
    const dom: DocumentFragment = JSDOM.fragment('<ul></ul>');
    const ul: HTMLElement = dom.querySelector('ul');

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
        add_child(ul, 'li', creator);
    }

    return ul.outerHTML;
}



/* ------------------------------------------------------------------------------------------------------ */
/*                                   External entry point                                                 */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Create four HTML fragments, to be stored in separate files. Each is in a `<section>` with a subtitle, except for the last one
 * that is simply an HTML `<ul>` list. These fragments can be included in the final report using the `data-include` feature of respec:
 * 
 * 1. A bulleted list of available implementations, linked (if available) to the Web Site of the implementation itself
 * 2. A series of subsections, each with its own table; each table row is a reference to the test and a series of cells (one per implementation) whether the test passes or not. This structure comes twice: one for consolidated results, and one for the
 * original ones
 * 3. A series of subsections, each with its own table; each table row contains basic metadata and cross references to the tests.
 * 4. A list of test creators
 * 
 * The return for each of those is in the form of a string containing the XHTML fragment
 * 
 */
export function create_report(data: ReportData): {implementations: string, results: string, tests: string, creators: string} {
    return {
        implementations : create_impl_list(data.implementers),
        results         : create_impl_reports(data),
        tests           : create_test_data(data),
        creators        : create_creator_list(data),
    }
}

