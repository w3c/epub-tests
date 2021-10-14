---
layout: none
title: Writing tests for EPUB 3.3
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
  folder into a compressed .epub file.
   
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

1. Within the branch, copy the
   [test template](https://github.com/w3c/epub-tests/tree/main/tests/xx-epub-template)
   (or the
   [fixed layout template](https://github.com/w3c/epub-tests/tree/main/tests/xx-fixed-layout-template)
   if you're testing fixed layout). Name your copy as explained in [naming](#naming) below.

1. Modify the template as necessary to implement the test.

1. Describe the test by adding the [metadata](#metadata) documented below to the package document.

1. Once your test is complete, drag the test's folder onto [eCanCrusher](https://www.docdataflow.com/ecancrusher/) to
   compress it into an `.epub` file, or create a compressed .epub file by some other means.

1. Open the `.epub` file in one or more reading systems to verify it behaves as expected. It is common for reading systems
   not to meet requirements, but if you cannot find *any* reading system that processes the test as expected, that may
   indicate an implementation mistake in the test. Fix as necessary.

1. Run the `.epub` through the online [EPUB Validator](http://validator.idpf.org/) or the
   [EPUBCheck](https://www.w3.org/publishing/epubcheck/) command-line tool to ensure you didn't make any silly mistakes. Fix
   if you did.

1. Create a pull request for your test change, including both the uncompressed folder and the compressed `.epub` file. Please
   ensure the PR's description clearly indicates which statement is being tested. Await review.

1. Once the pull request has been merged, fork the repo for the spec you are testing —
   [EPUB 3.3](https://github.com/w3c/epub-specs/blob/main/epub33/core/index.html) or
   [EPUB Reading Systems 3.3](https://github.com/w3c/epub-specs/blob/main/epub33/rs/index.html).

1. In the spec document, find the anchor element for the normative statement. If there is no anchor element, add one, using
   the same naming conventions as the test. Then add a `data-tests` attribute to the anchor element with the name(s) of your
   test(s) as comma-separated anchors:

   ```html
   <p id="confreq-rs-epub3-xhtml" class="support" data-tests="#confreq-rs-epub3-xhtml">Reading
      Systems MUST process <a href="https://www.w3.org/TR/epub-33/#sec-xhtml">XHTML Content
      Documents</a> [[EPUB-33]].</p>

   ...

   <p id="confreq-rs-epub3-images"
      data-tests="#cmt-gif,#cmt-jpg,#cmt-png,#cmt-svg,#cmt-webp">If a Reading System has a
      <a>Viewport</a>, it MUST support the
      <a href="https://www.w3.org/TR/epub-33/#cmt-grp-image">image Core Media Type Resources</a>
      [[EPUB-33]].</p>
   ```

1. Create a pull request for your spec change and await review.


## Naming

Because sections are frequently renumbered, individual tests should be named based on section anchors within the spec. For
example, a test for
[the requirement for reading systems to support MathML](https://www.w3.org/TR/epub-rs-33/#confreq-mathml-rs-behavior) should
have a folder named `confreq-mathml-rs-behavior` and a compressed file named `confreq-mathml-rs-behavior.epub`.

If a normative statement does not already have a unique anchor, please create one, following naming examples elsewhere in the
spec. (You will commit this new anchor along with your `data-tests` attribute in a pull request against the spec, as
explained in the [step-by-step instructions](#step-by-step) above.)

If multiple tests are necessary for a single anchor, differentiate the test cases by appending an underscore and a unique
identifier. For example, a test that ensures reading systems treat explicit `dir="auto"` identically to omitting `dir`, as
part of the requirement to
[automatically handle base direction of the package document](https://www.w3.org/TR/epub-rs-33/#confreq-rs-pkg-dir-auto)
might be named `confreq-rs-pkg-dir-auto_explicit`.


## Metadata

The package document for each test must contain the following metadata, which is used to
[generate test reports](#generated-test-reports):

* `dc:identifier`: A unique identifier for the test (unique across _all_ tests). This is typically the test’s directory name.
  It is used as an anchor in the reports, so its format must be suitable as an HTML fragment identifier.

* `dc:title`: The title of the test. It is used in the test description and should be as concise as possible.

* `dc:description`: A longer description of the test for the generated test report.

* `dc:coverage`: Which section of the report the test should be listed in. The report has a separate table for each section
   to make it more readable. The following sections currently exist:

   *  Content Documents
   *  Core Media Types
   *  Internationalization
   *  Navigation Documents
   *  Open Container Format
   *  Package Documents

   If you add a new coverage value, please edit this document to list it above.

* `dcterms:isReferencedBy` (repeated, as part of a `meta` element): A series of URLs that refer to the relevant sections of
   the specification. These links provide back-links to the relevant normative statements from each test entry in the
   generated report.

* `dcterms:alternative` (optional, as part of a `meta` element): Overrides the value of `dc:title` in the generated test
  report. This should be used if the subject of the test is the value of `dc:title` itself (e.g., testing the base direction
  of the `title` element).

In this example, only the relevant metadata items are shown:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" xmlns:epub="http://www.idpf.org/2007/ops" version="3.0" xml:lang="en" unique-identifier="pub-id">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:identifier id="pub-id">test_id_12345</dc:identifier>
        <dc:title dir="rtl" xml:lang="he">CSS: הרפתקה חדשה!</dc:title>
        <dc:description>
            The dc:title element contains text whose proper rendering requires bidi control. 
            The element's 'dir' attribute is set to 'rtl'; the title should display from right to left.
        </dc:description>
        <dc:coverage>Internationalization</dc:coverage>
        <meta property="dcterms:isReferencedBy">https://www.w3.org/TR/epub-33/#attrdef-dir</meta>
        <meta property="dcterms:isReferencedBy">https://www.w3.org/TR/epub-rs-33/#sec-pkg-doc-base-dir</meta>
        <meta property="dcterms:alternative">Title's base direction set to RTL</meta>
    </metadata>
    ...
 </package>
```


## Implementation reports

The `reports` directory contains implementation reports in form of JSON files, one per reading system. The structure of the
JSON file is as follows:

* `name`: The name of the reading system.

* `variant` (optional): The name of the reading system variant. Typical values may be `Android,` `iOS`, or `Web`, if one
  implementation (i.e., sharing the same `name` value) has specific versions running in those environments.

* `ref` (optional): A URL that creates a link on the name of the reading system in the implementation report.

* `tests`: An object with the implementation results. Each key is a test's unique identifier (its `dc:identifier`) with a
  values of `true` or `false` for tests that pass or fail, respectively. If a test is not listed, the implementation report
  will show a value of N/A, indicating that the implementation has not run the test.

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

The template file in `reports/xx-template.json` should list all available test identifiers.


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
