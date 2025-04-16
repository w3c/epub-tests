# What to do for a new spec version

EPUB evolves. This repository was created while [EPUB 3.3](https://www.w3.org/TR/epub-33) was developed. In 2025, the W3C engaged in the development of [EPUB 3.4](https://www.w3.org/TR/epub-34), and, maybe, there will be an EPUB 3.5 in a few years. Because these are all backward compatible revisions, any test, developed for EPUB 3.3 should be valid for EPUB 3.4 or EPUB 3.5. In other words, this repository should simply expand, providing an ever-growing set of tests that can be used both for the community at large and for the Candidate Recommendation exit criteria in the W3C process (which usually requires at least two, independent implementation for every normative feature).

When upgrading from EPUB 3.n to EPUB 3.n+1, the following changes on the repository must be done:

- Modify the `Readme.md` file, changing the corresponding revision.
- Modify the first paragraph of the introduction section of `docs/drafts/index.html` by updating the revision number and related URL-s.
- Modify the abstract section of `docs/drafts/results.html` by updating the revision number and related URL-s.
- Modify the configuration file in `docs/drafts/config.json` by expanding/updating the URL-s in the `"document_mappings"` array. The most important entries are the last two that are used to refer to the latest editors' drafts from the [test table](https://w3c.github.io/epub-tests/).
- Modify the metadata in the [tests/xx-epub-template/EPUB/package.opf] and [tests/xx-fixed-layout-template/EPUB/package.opf] files: the `<meta refines="#coverage" property="schema:version">` entry should refer to the latest revision number.
- (Possibly update this document…)
