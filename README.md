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
