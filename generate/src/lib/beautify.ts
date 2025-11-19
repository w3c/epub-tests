import * as jsBeautify from "js-beautify";

/** Suffix mapping to beautify options */
export type ConfigOptions = Record<string, number | boolean | string>;

/** The function that must be used, at the end, to beautify the string representation of data. */
type BeautyFunction = (content: string, options: ConfigOptions | undefined) => string;


/**
 * Get a beautification function depending on a file suffix.
 * It is internally tricky, because it takes into account the differences
 * in Typescript when handling Deno/ESM and Node.js/CommonJS module systems.
 * (otherwise it does not work for js-beautify...)
 *
 * Give honor to whom honor is due: this trick comes from VSCode's AI Chat, relying, I believe, on Claude.
 *
 * @param suffix
 * @returns
 */
function getBeautify(suffix: string): BeautyFunction {
    type BeautifyModule = typeof jsBeautify & { default?: typeof jsBeautify; };
    const b = (jsBeautify as BeautifyModule).default || jsBeautify;

    switch (suffix) {
        case "js":
        case "ts":
        case "json":
        case "jsonld":
            return b.js;
        case "html":
        case "xhtml":
            return b.html;
        case "css":
        case "scss":
            return b.css;
        default:
            throw new Error(`Unknown suffix for js-beautify: ${suffix}`);
    }
}

export function beautify(content: string, suffix: string = "html"): string {
    const config: ConfigOptions = {
        max_preserve_newlines: 2,
        indent_with_tabs: false,
        end_with_newline: true,
        indent_size: 4,
        wrap_line_length: 0,
    };
    const beautifyFunction: BeautyFunction = getBeautify(suffix);
    return beautifyFunction(content, config);
}
