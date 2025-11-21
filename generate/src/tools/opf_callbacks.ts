import { JSDOM } from 'jsdom';

/**
 * A typical modification function, using the DOM
 *
 * @param opf
 * @returns
 */
function change_date(opf: string): string {
    const dom = new JSDOM(opf, { contentType: 'application/xml' });
    const document = dom.window.document;
    const metas = document.getElementsByTagName("meta");
    for (let i = 0; i < metas.length; i++) {
        const meta = metas[i];
        if (meta.getAttribute('property') === 'dcterms:modified') {
            meta.textContent = ((new Date()).toISOString()).split('.')[0]+'Z';
        }
    }

    return dom.serialize();
}

/**
 * This is just an empty placeholder if we need it for debug...
 * @param opf
 * @returns
 */
function nop(opf: string): string {
    return opf;
}

type Callback = (text: string) => string;

export const callbacks: Callback[] = [
    change_date
    // nop
]




