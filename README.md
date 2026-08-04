![W3C Logo](https://www.w3.org/Icons/w3c_home)

# Test repository for the EPUB 3 specifications

This repository contains tests to validate the implementability of the W3C's EPUB 3 specifications, specifically core
[EPUB 3](https://www.w3.org/TR/epub/) (the spec for the EPUB format itself) and
[EPUB Reading Systems 3](https://www.w3.org/TR/epub-rs/) (the spec for applications that read EPUB files). Our
objective is to test every normative statement (that is, every
[`MUST` or `SHOULD` or `MAY`](https://datatracker.ietf.org/doc/html/bcp14), etc.).

The [test reports](https://w3c.github.io/epub-tests/) describe all the tests, including
[implementation results](https://w3c.github.io/epub-tests/results) and
[how to contribute](https://w3c.github.io/epub-tests/contributing).

The current, tested EPUB 3 version is [EPUB 3.4](https://www.w3.org/TR/epub-overview-34). Because this version is backward compatible with earlier versions, most of these tests are also valid for earlier versions. Each test is assigned a `version` value, denoting the EPUB revision where the test has been added in as shown on the [test table](https://w3c.github.io/epub-tests/)

Note that the current setup is based on release 3.4 of the EPUB 3 specification. See the separate [NewVersion.md](generate/NewVersion.md) file for the steps to follow when updating the repository for a new version of the EPUB 3 specification.

## How to run tests for EPUB 

Running tests mean loading each test as a separate EPUB Publication, and checking whether the reading systems fulfills the requirement of that specific test. Each test outlines the pass or fail criteria for the test. The results are collected in an implementation report file and uploaded to the test repository.

To make the running of the tests easier, a [test catalogue file](https://w3c.github.io/epub-tests/opds/opds.json) is generated using the [OPDS](https://drafts.opds.io/opds-2.0.html) format. Several reading systems understand this catalogue format, and can upload the full test suite easily.

Alternatively, the test repository can be forked, and downloaded to the tester's machine. To make the testing step easier, there is a `generateEpubs.sh` script in the `tests` folder of repository that will generate an epub version of each test. To fork this repository, go to the "Fork" menu at the top of this screen. To create a local copy of the files, download the ZIP file for this repository from the "Code" menu at the top of this page.

### Generating the tests

All of the test files are located in the `tests/` folder. Using Terminal/your preferred command line tool, go to your local version of the repository, or the ZIP file location, and open that folder: 

`cd [FOLDER]/epub-tests/tests/`

To generate the tests, run the `generateEpubs.sh` script file:

`sh generateEpubs.sh`

The script will run and the `.epub` files will be added to the `tests/` folder. You can then take those files and load them to your reading application or servers.

### The test report

Save a copy of the template file: [xx-template.json](https://w3c.github.io/epub-tests/reports/xx-template.json), change the file name to reflect the reading system and platform being tested (if multiple are being tested). 

`acme-ios.json`

Open the file in any text editor application and fill in the reporting fields: 

- `name`: The name of the reading system.
- `variant` (optional): The name or properties of the reading system variant. Typical values may be Android, iOS, or Web, if one implementation (i.e., sharing the same name value) has specific versions running in those environments. In addition to the properties of the reading system, testers may also include information on how the tests were run, for example, if a screen reader was used with the reading system.
- `ref` (optional): A URL that creates a link on the name of the reading system in the implementation report.
- `tested_by` (optional): Can be `"implementer"` or `"third-party"`, this field is to help track whether the test results were provided by the platform or a third-party tester.
- `tests`: An object with the list of the test results. Each key is a test's unique identifier (its `dc:identifier`) with a value of `true`, `false`, `"n/a"`, or `null`. Use `true` for a test that passes, `false` for a test that fails, `"n/a"` for a test is not applicable. A test would have a result of `null` if it is not yet performed. If a test is not listed its value is considered to be null. The implementation report will show a value of "?" for null, indicating that the implementation has not run the test.

Here is an example:

```json
{
    "name"  : "ACME Books",
    "ref"   : "https://www.example.org/acme",
    "variant" : "iOS, v1.0",
    "tests" : {
        "pub-cmt-gif": true,
        "pub-cmt-jpeg": true,
        "pkg-dir_rtl-root-ltr": false,
        "pkg-dir_rtl-root-unset": true,
        "pkg-dir_unset-root-rtl": false,
        "pkg-dir_unset-root-unset": true,
        "pkg-dir-auto_root-rtl": null,
        "pkg-dir-auto_root-unset": false,
        "pkg-linked-records": "n/a"
    }
}
```

The test report template will list all of the available tests, with the default value set to `null`.

### Running the tests and completing the report

Once the test files are loaded on your reading system, running the tests is simple. Open each file, where the test scenario will be on the first or second page, explaining the condition in which the test passes. In most cases, the test is within the EPUB itself, however there are some tests related to the presentation of metadata such as the title or author, the test will inform you of what to look for.

For each test, there are four possible values to give in the JSON:

- `null`: the test has not been run
- `true`: the test passes according to the criteria of the test 
- `false`: the test fails according to the criteria of the test
- `"n/a"`: the test does not apply to your reading system (the feature is not implemented or cannot be supported by the reading system, such as audio playback for reading systems without audio support) [NOTE: the quotes around "n/a" are required formatting]

Complete as many tests for as many platforms as you can!

### Submitting the test results

If you are not familiar with GitHub or creating PRs (pull requests), you are welcome to submit your test reports by [opening a Test Results Submission issue](https://github.com/w3c/epub-tests/issues/new/choose) on the repository and attaching the reports, or emailing the `.json` files to [group-pm-wg-chairs@w3.org](mailto:group-pm-wg-chairs@w3.org).

If you have forked this repository, you can create a PR with the test results. All test results files should be added to the `results/` folder and follow the naming conventions outlined in [The test report](#the-test-report) section of this document.

## Frequently Asked Questions (FAQs)

- **What if I have more than one reading application?**
  - Many platforms have multiple reading applications and we understand running tests on all of them might be challenging. The preference would be to have a complete test suite for all platforms, but if that is not possible, we'd request testing either your most used platforms, or if your applications share a common rendering engine or several engines, focus on testing the most representative platforms for those engines.
- **I submitted test results for EPUB 3.3 and many of these tests seem the same, do I need to do them again?**
  - Many of the tests are similar or unchanged from EPUB 3.3, however it has been 3 years since we tested EPUB 3.3 and it's very likely your platforms or the underlying systems have changed, so testing again is recommended to ensure the most accurate results. These results are used not only by W3C to confirm the standard's implementation, but by industry to understand the support levels for different EPUB features.
- **We are a reading platform that also distributes content, how do we test the files?**
  - For reading platforms that also ingest and distribute content, such as ebookstores, we recommend uploading the test books to your platforms through the same channels as other content, to ensure the most accurate experience. This is especially true for any platforms that pre-process content to optimize features for their reading systems.