---
layout: page
---

![W3C Logo](https://www.w3.org/Icons/w3c_home)

# Writing tests for EPUB 3.3

The [w3c/epub-tests/](https://github.com/w3c/epub-tests/) repository contains tests to validate the implementability of the
W3C's EPUB 3.3 specifications, specifically core [EPUB 3.3](https://www.w3.org/TR/epub-33/) (the spec for the EPUB format
itself) and [EPUB Reading Systems 3.3](https://www.w3.org/TR/epub-rs-33/) (the spec for applications that read EPUB files).
Our objective is to test every normative statement (that is, every
[`MUST` or `SHOULD` or `MAY`](https://datatracker.ietf.org/doc/html/bcp14), etc.).

Existing tests are described in the [generated test reports](#generated-test-reports).

This page explains how to write new tests.


## Prerequisites

* Install [eCanCrusher](https://www.docdataflow.com/ecancrusher/) or another utility or local script that can turn an EPUB
  folder into a compressed EPUB file.
   
   * On macOS, a command in Terminal can zip EPUB. Go to the folder containing the files and enter the following:
   `zip -X0 book.epub mimetype; zip -Xur9D book.epub META-INF OEBPS -x ‘*.DS_Store’ `

* Ensure you have several EPUB reading systems available to validate your tests (that is, validate that you have written the
  test correctly; many tests will nonetheless fail in individual reading systems). For example:

  * Apple Books (preinstalled on macOS)

  * [calibre](https://calibre-ebook.com/download)

  * [EPUBReader for Chrome](https://chrome.google.com/webstore/detail/epubreader/jhhclmfgfllimlhabjkgkeebkbiadflb)

  * [EPUBReader for Firefox](https://addons.mozilla.org/en-US/firefox/addon/epubreader/)

  * [Google Play Books for the web](https://play.google.com/books/uploads/ebooks) (uploads here will appear on other devices
    where you're signed into the same Google account)

  * [Kindle Previewer](https://www.amazon.com/gp/feature.html?ie=UTF8&docId=1000765261)

  * [Kobo Books](https://www.kobo.com/ca/en/p/apps) and [instructions for sideloading](https://github.com/kobolabs/epub-spec#sideloading-for-testing-purposes)

  * [Thorium Reader](https://www.edrlab.org/software/thorium-reader/)

  * [VitalSource Bookshelf](https://support.vitalsource.com/hc/en-us/sections/360002383594-Download-Bookshelf) and [instructions for sideloading](https://support.vitalsource.com/hc/en-us/search?utf8=✓&query=side+loading+epubs)



## Step-by-step

1. Find an untested normative statement in the [EPUB 3.3](https://w3c.github.io/epub-specs/epub33/core/) or
   [EPUB Reading Systems 3.3](https://w3c.github.io/epub-specs/epub33/rs/) specs to test — that is, a statement that does not
   have an expandable "tests" section like
   [Core Media Types](https://w3c.github.io/epub-specs/epub33/rs/#sec-epub-rs-conf-cmt). (Note that these links point at the
   working drafts of the spec on GitHub, not the published versions on w3.org; the published spec hides the "tests" sections.
   In the published versions, you can still see whether a statement is tested by checking whether its anchor element has a
   `data-tests` attribute.)

1. Claim the normative statement by [creating an issue](https://github.com/w3c/epub-tests/issues/new) in the
   [w3c/epub-tests](https://github.com/w3c/epub-tests/) repo. For example, see the issue
   [Test obfuscated resources (fonts)](https://github.com/w3c/epub-tests/issues/39).

1. If you are an owner of [w3c/epub-tests](https://github.com/w3c/epub-tests/), create a branch on that repo for your new
   test. Otherwise, fork the repo and create a branch on your fork. (It's easier for reviewers to clone a PR to validate the
   test if it's in the original repo.)

1. Within the branch, copy the [test template](https://github.com/w3c/epub-tests/tree/main/tests/xx-epub-template)
   (or the [fixed layout template](https://github.com/w3c/epub-tests/tree/main/tests/xx-fixed-layout-template) if you're
   testing fixed layout). Name your copy as explained in [naming](#naming) below.

1. Modify the template as necessary to implement the test.

1. Describe the test by adding the [metadata](#metadata) documented below to the package document.

1. Once your test is complete, drag the test's folder onto [eCanCrusher](https://www.docdataflow.com/ecancrusher/) to
   compress it into an EPUB file, or create a compressed EPUB file by some other means.

1. Open the EPUB file in one or more reading systems to verify it behaves as expected. It is common for reading systems
   not to meet requirements, but if you cannot find *any* reading system that processes the test as expected, that may
   indicate an implementation mistake in the test. Fix as necessary.

1. Run the EPUB through the online [EPUB Validator](http://validator.idpf.org/) or the
   [EPUBCheck](https://www.w3.org/publishing/epubcheck/) command-line tool to ensure you didn't make any silly mistakes. Fix
   if you did.

1. Create a pull request for your test change, including both the uncompressed folder and the compressed EPUB file. Please
   ensure the PR's description clearly indicates which statement is being tested. Await review.

1. Once the pull request has been merged, fork the repo for the spec you are testing —
   [EPUB 3.3](https://github.com/w3c/epub-specs/blob/main/epub33/core/index.html) or
   [EPUB Reading Systems 3.3](https://github.com/w3c/epub-specs/blob/main/epub33/rs/index.html).

1. In the spec document, find the anchor element for the normative statement. If there is no anchor element, add one, using
   the same naming conventions as nearby anchors. Then add a `data-tests` attribute to the anchor element with the name(s) of
   your test(s) as comma-separated anchors:

   ```html
   <p id="confreq-rs-epub3-xhtml" class="support" data-tests="#doc-xhtml-support">Reading Systems MUST process
      <a href="https://www.w3.org/TR/epub-33/#sec-xhtml">XHTML Content Documents</a> [[EPUB-33]].</p>

   ...

   <p id="confreq-rs-epub3-images"
      data-tests="#pub-cmt-gif,#pub-cmt-jpg,#pub-cmt-png,#pub-cmt-svg,#pub-cmt-webp">If a Reading System has a
      <a>Viewport</a>, it MUST support the
      <a href="https://www.w3.org/TR/epub-33/#cmt-grp-image">image Core Media Type Resources</a>
      [[EPUB-33]].</p>
   ```

1. Create a pull request for your spec change and await review.


## Naming

Test names should start with a three-letter abbreviation that corresponds to the value of the [`dc:coverage`](#metadata)
element below (for example, `cnt` for Content Documents, `pkg` for Package Documents, etc.), followed by a short hyphenated
identifier that makes clear which requirement is under test. For example, a test for
[the requirement for reading systems to support MathML](https://www.w3.org/TR/epub-rs-33/#confreq-mathml-rs-behavior) should
be named `cnt-mathml-support`.

If multiple tests are necessary for a single normative statement, differentiate the test cases by appending an underscore and
a unique identifier. For example, a test that ensures reading systems treat explicit `dir="auto"` identically to omitting
`dir`, as part of the requirement to
[automatically handle base direction of the package document](https://www.w3.org/TR/epub-rs-33/#confreq-rs-pkg-dir-auto)
might be named `pkg-dir-auto_explicit`.


## Metadata

The package document for each test must contain the following metadata, which is used to
[generate test reports](#generated-test-reports):

* `dc:identifier`: A unique identifier for the test (unique across _all_ tests). This is typically the test’s directory name.
  It is used as an anchor in the reports, so its format must be suitable as an HTML fragment identifier.

* `dc:title`: The title of the test, in sentence case. It is used in the test description and should be as concise as
  possible.

* `dc:creator` (may be repeated): Creator(s) of the tests.

* `dc:description`: A longer description of the test for the generated test report.

* `dc:coverage`: Which section of the report the test should be listed in. The report has a separate table for each section
   to make it more readable. The current list of sections is listed in a
   [JSON configuration file](https://github.com/w3c/epub-tests/blob/main/docs/drafts/config.json); if you add a new coverage
   value, edit that JSON file in the same pull request to add the new value under the `coverage_labels`. That list should
   reflect the order of the corresponding sections in the EPUB specification.

* `dcterms:isReferencedBy` (repeated, as part of a `meta` element): A series of URLs that refer to the relevant sections of
   the specification. These links provide back-links to the relevant normative statements from each test entry in the
   generated report.

* `dcterms:alternative` (optional, as part of a `meta` element): Overrides the value of `dc:title` in the generated test
  report. This should be used if the subject of the test is the value of `dc:title` itself (e.g., testing the base direction
  of the `title` element).

* `belongs-to-collection` (optional, as part of a `meta` element): The value is `must`, `should`, or `may`, and it specifies whether the test corresponds to a _MUST_ (or _MUST NOT_), _SHOULD_ (or _SHOULD NOT_), or _MAY_ (or _MAY NOT_) statement in the specification, respectively. If the metadata is not provided, or any other value is used, the default `must` value is used. 

* `dcterms:rights` as part of a `link` element: the rights associated with the test. Except for the rare cases the `href` attribute value should be set to `https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document` (i.e., to the W3C Software and Document Notice and License).

* `dcterms:rightsHolder` as part of a `link` element: the holder of the rights expressed by `dcterms:rights`. The `href` attribute value should be set to `https://www.w3.org/` in case the the rights value is set to the W3C Software and Document Notice and License, otherwise to a URL identifying the right holder.


In this example, only the relevant metadata items are shown (a test may have additional, test-specific metadata items):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" xmlns:epub="http://www.idpf.org/2007/ops" version="3.0" xml:lang="en" unique-identifier="pub-id">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:coverage>Internationalization</dc:coverage>
        <dc:creator>Dan Lazin</dc:creator>
        <dc:creator>Ivan Herman</dc:creator>
        <dc:description>
            The 'dc:title' element contains text whose proper rendering requires bidi control. The element's 'dir' attribute
            is set to 'rtl'; the title should display from right to left.
        </dc:description>
        <dc:identifier id="pub-id">pkg-dir_rtl-root-unset</dc:identifier>
        <dc:title dir="rtl" xml:lang="he">CSS: הרפתקה חדשה!</dc:title>
        <link rel="dcterms:rights" href="https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document"/>
        <link rel="dcterms:rightsHolder" href="https://www.w3.org"/>
        <meta property="dcterms:alternative">Title's base direction set to RTL</meta>
        <meta property="belongs-to-collection">must</meta>
        <meta property="dcterms:isReferencedBy">https://www.w3.org/TR/epub-33/#attrdef-dir</meta>
        <meta property="dcterms:isReferencedBy">https://www.w3.org/TR/epub-rs-33/#confreq-rs-pkg-dir</meta>
    </metadata>
    ...
 </package>
```

(Note that, in this case, the `<meta property="belongs-to-collection">must</meta>` is not necessary, because that corresponds to the default value; it is only there as an example.)


## Implementation reports

The `reports` directory contains implementation reports in form of JSON files, one per reading system. The structure of the
JSON file is as follows:

* `name`: The name of the reading system.

* `variant` (optional): The name of the reading system variant. Typical values may be `Android,` `iOS`, or `Web`, if one
  implementation (i.e., sharing the same `name` value) has specific versions running in those environments.

* `ref` (optional): A URL that creates a link on the name of the reading system in the implementation report.

* `tests`: An object with the implementation results. Each key is a test's unique identifier (its `dc:identifier`) with a
  values of `true`, `false`, or `null` for tests that pass, fail, or not tested, respectively. If a test is not listed, or its value is `null`, the implementation report will show a value of N/A, indicating that the implementation has not run the test.

Here is an example of a small test report:

```json
{
    "name"  : "ACME Books",
    "ref"   : "https://www.example.org/acme",
    "tests" : {
        "pub-cmt-gif": true,
        "pub-cmt-jpeg": true,
        "pkg-dir_rtl-root-ltr": false,
        "pkg-dir_rtl-root-unset": true,
        "pkg-dir_unset-root-rtl": false,
        "pkg-dir_unset-root-unset": true,
        "pkg-dir-auto_root-rtl": null,
        "pkg-dir-auto_root-unset": false
    }
}
```

The template file in `reports/xx-template.json` should list all available test identifiers, with all values set, initially, to `null`.


## Generated test reports

When new tests are committed to the repo, a GitHub Actions workflow generates a report from the tests in the `tests`
directory and [implementation reports](#implementation-reports) in the `reports` directory.

The report consists of two HTML pages, namely:

* A [test suite description](https://w3c.github.io/epub-tests/) that lists each test, split into one table per unique
  `dc:coverage` value. Each table has one row per test, showing the test's ID, title, description, back-links to the relevant
  normative statements in the spec, and links to the implementation results.

* An [implementation report](https://w3c.github.io/epub-tests/results) that lists reading systems that have submitted test
  results along with their results tables. Each table has one row per test and one column per implementation, with cells
  indicating whether the test passed, failed, or has not been run.
