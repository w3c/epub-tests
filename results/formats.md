# Test and test report formats

(To be completed by Dan.)


The test reporting consist of the generation of two HTML files, namely:

- An [implementation report](https://iherman.github.io/epub-testing/) providing a short list of implementation that have submitted test results, and implementation results tables, one row for each tests and one column for each implementation, with the cell values of `true`/`false`/`n.a` denoting whether the test has passed, failed, or has not be run, respectively.
- A [Test Suite Description](https://iherman.github.io/epub-testing/tests.html), providing information of each test (title, short description, link to the relevant parts of the specifications, and links to the test results)

These reports are generated automatically using all available tests in the `tests` directory and all available implementation reports in the `reports` directory.

## Test formats

By “test”, we mean a non-zipped directory with the EPUB 3.3 content. In other words, _not_ the generated EPUB file itself but its (uncompressed) content when unzipping it. From the testing point of view the only restriction is that the OPF file can be found at the following location:

```
(directory)/OPS/package.opf
```

The test metadata is expressed as part of the regular metadata within the OPF file. The following terms are relevant:

- `dc:identifier`: unique identifier (unique across _all_ tests) for the test. This is typically the test’s directory name. It is used an fragment identifier in the reports. This value is _required_, and its format should make it suitable for an HTML fragment identifier.
- `dc:title`: title of the test. It is used in the test description and should be as concise as possible.
- `dcterms:alternative` (as part of a `meta` element): overwrites the value of `dc:title`. This should be used if the subject of the test is the value of `dc:title` itself (e.g., the test is about the base direction of the title element). 
- `dc:description`: longer description of the tests, reused in the generated test descriptions.
- `dc:coverage`: is used as a “sectioning” tool for the report. I.e., the final report would create a separate table per each section to make the report more readable. Examples are "Internationalization features", "Core media", etc.
- `dcterms:isReferencedBy` (as part of a `meta` element): is a series of URL-s, referring to the relevant sections of the Recommendations. These links provide a back-link into the documents from each test description to identify the relevant normative section(s) that the test is supposed to check.

Here is an example (only the relevant metadata items are shown):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" xmlns:epub="http://www.idpf.org/2007/ops" version="3.0" xml:lang="en" unique-identifier="pub-id">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title dir="rtl" xml:lang="he">CSS: הרפתקה חדשה!</dc:title>
        <dc:identifier id="pub-id">test_id_12345</dc:identifier>
        <dc:coverage>Internationalization features</dc:coverage>
        <meta property="dcterms:alternative">Correct base direction setting on the element</meta>
        <dc:description>
            The dc:title element contains a text whose proper rendering requires bidi control. 
            The element's 'dir' attribute is set to 'rtl'; the title should display correctly.
        </dc:description>
        <meta property="dcterms:isReferencedBy">https://www.w3.org/TR/epub-33/#attrdef-dir</meta>
        <meta property="dcterms:isReferencedBy">https://www.w3.org/TR/epub-rs-33/#sec-pkg-doc-base-dir</meta>
    </metadata>
    ...
 </package>
```

## Test report formats

Test reports consist of separate JSON files, one per implementers. The structure of the JSON file is as follows:

- `name`: the name of the implementation (this will appear in the report). 
- `variant`: the name of the variant. Typical values may be IOS, Web, Android in case the same implementation (i.e., sharing the same `name` value) has specific versions running in those environments. This entry is _optional_.
- `ref`: a URL, that should be used to turn the name of the implementation into a hyperlink with this value as a target. This entry is _optional_.
- `tests`: an object with the implementation results. Each field of this object refers to the unique identifier of the test, and the value is `true` or `false`, reflecting the test result. A test may be missing (i.e., the implementation has not run this test), and this will be reflected in the final report.

Here is an example of a small test report:

```json
{
    "name"  : "ACME Books",
    "ref"   : "https://www.example.org/acme",
    "tests" : {
        "cmt-gif": true,
        "cmt-jpeg": true,
        "package-title-dir-rtl-001": false,
        "package-title-dir-rtl-002": true,
        "package-title-dir-rtl-003": false,
        "package-title-dir-rtl-004": true,
        "package-title-dir-rtl-005": false,
        "package-title-dir-rtl-006": false
    }
}
```

Note that there is a template file in `reports/templates/template.json` that lists all available test identifiers.







