/**
 * Generation of the [OPDS](https://specs.opds.io/opds-1.2) file for the full set of tests.
 *
 *  @license [W3C Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software)
 *  @packageDocumentation
 */

import { TestData, Constants } from './types.ts';
import { stringComparison }    from './data.ts';

/* ------------------------------------------------------------------------------------------------------ */
/*                     Subset of OPDS specification used here in Typescript types                         */
/* ------------------------------------------------------------------------------------------------------ */

interface PublicationMetadata {
    "@type": string;
    identifier: string;
    title: string;
    author: string | string[];
    description: string;
    collection: string;
    modified: string;
    publisher: string;
    subject: string | string[];
}

interface PublicationLink {
    type: string;
    rel: string;
    href: string;
}

interface ImageLink {
    type: string;
    href: string;
    height?: number;
    width?: number;
}

interface Publication {
    metadata: PublicationMetadata;
    links: PublicationLink[];
    images: ImageLink[];
}

/**
 * The OPDS specification's translation into a Typescript types. More exactly, the part of the full OPDS
 * specification that is used for the EPUB test suite.
 */
export interface OPDS {
    metadata: {
        title: string;
    };
    links : PublicationLink[];
    publications: Publication[];
}

/**
 * Generate the OPDS file. The entries are sorted by the modification date of the test cases.
 *
 * @param tests All the test data, as extracted from the corresponding package documents
 * @returns
 */
export function createOPDS(tests: TestData[]): OPDS {
    /** All cover images are identical */
    const images: ImageLink[] = [{
        href   : `${Constants.OPDS_DIR_URL}/${Constants.DOC_OPDS_COVER_PNG}`,
        type   : 'image/png',
        height : 849,
        width  : 600,
    },{
        href : `${Constants.OPDS_DIR_URL}/${Constants.DOC_OPDS_COVER_SVG}`,
        type : 'image/svg',
    }]

    /* Convert each test data into the formalism used by OPDS; the results are sorted
       with the tests' modification dates as keys
     */
    const publications = tests.map((test: TestData): Publication => {
        const links: PublicationLink[] = [{
            type : `${Constants.EPUB_MEDIA_TYPE}`,
            rel  : 'http://opds-spec.org/acquisition/open-access',
            href : `${Constants.TEST_DOWNLOAD_URL_BASE}/${test.identifier}.epub`,
        }]
        const metadata: PublicationMetadata = {
            "@type"     : 'http://schema.org/Book',
            identifier  : `${Constants.TEST_URL_BASE}/${test.identifier}`,
            title       : test.title,
            author      : test.creators.length === 1 ? test.creators[0] : test.creators,
            description : test.description,
            collection  : test.coverage,
            modified    : test.modified,
            publisher   : 'W3C',
            subject     : ['epub-test'],
        };

        return {
            metadata,
            links,
            images,
        }
    }).sort((a: Publication, b: Publication): number => {
        const time_comparison = stringComparison(a.metadata.modified, b.metadata.modified);
        return time_comparison !== 0 ? -1 * time_comparison : stringComparison(a.metadata.identifier, b.metadata.identifier);
    })

    /* Add the OPDS metadata to the list of all the publications. */
    return {
        metadata : {
            title : `W3C EPUB ${Constants.EPUB_VERSION} Test Suite`,
        },
        links : [
            {
                href : `${Constants.OPDS_DIR_URL}/${Constants.DOC_OPDS}`,
                type : 'application/opds+json',
                rel  : 'self',
            },
        ],
        publications,
    }
}

