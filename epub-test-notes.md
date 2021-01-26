# EPUB 3.3 Reading Systems

## 2. EPUB Publications 

### EPUB 3 Processing

*  It MUST process the EPUB Container as defined in § 7. Open Container Format Processing.
   * this is not testable

*  It MUST process the Package Document as defined in § 3. Package Document Processing.
   * this is not testable
   
*  It MAY support an arbitrary set of Foreign Resource types, and MUST process fallbacks for unsupported Foreign Resources as defined in Foreign Resources [EPUB-33] if not.
    * manifest-fallback-001.epub (JSON spine item[application/json] with XHTML fallback)
    * manifest-fallback-002.epub (XML spine item[application/dtc+xml] with XHTML fallback
    * manifest-fallback-005.epub (XML spine item[application/xml] with XHTML fallback
    * manifest-fallback-004.epub (PSD image in content doc with PNG fallback)



*  It SHOULD support remote resources, as defined in Resource Locations [EPUB-33].

*  It MUST process XHTML Content Document as defined in § 4.1.1 XHTML Conformance.


*  It MUST process SVG Content Documents as defined in § 4.2 SVG Content Documents.

*  If it has a Viewport, it MUST support visual rendering of XHTML Content Documents as defined in § 4.3.1 CSS Conformance.
    * viewport-css-001.epub is the Acid 2 test adapted for XHTML5 and EPUB. This seems like a quick way to test for broad CSS support. And it's fun. 

*  If it has a Viewport, it MUST support the image Core Media Type Resources [EPUB-33].

*  If it has the capability to render pre-recorded audio, it MUST support the audio Core Media Type Resources [EPUB-33] and SHOULD support Media Overlays [EPUB-33].

*  If it supports Text-to-Speech (TTS) rendering, it SHOULD support Pronunciation Lexicons, [CSS3Speech] and SSML attributes [EPUB-33] in XHTML Content Documents.


### Backward Compatibility 

*  It MUST attempt to process an EPUB Publication whose Package Document version attribute is less than "3.0".
   * package-version-000.epub has `package version="0"` to test if a reading system will open such a file. 
    
    
### XML Processing 

*  It MUST be a conformant non-validating processor [XML].
   * xml-non-validating-parser-001.epub uses a non-well-formed content document (missing close p tag)
   * xml-non-validating-parser-001.epub uses comments out a spine item in the package file to make sure the EPUB processor understands XML comments. 

*  It MUST NOT resolve external identifiers [XML].
    * xml-external-entities-001.epub uses an external HTML entity; the test should not show that content. 

*  It MUST be a conformant processor as defined in [XML-NAMES].
    * xml-names-001.epub has a `<p::p>` tag which should fail because XML Names forbids two colons in an element name. 

*  It MUST be a conformant application as defined by [XMLBase].
    * xml-base-001.epub uses an `xml:base` attribute in the `nav` file to help specify the link to the content document. If the processor doesn't support `xml:base`, the link should fail. 

## 3. Package Document Processing

### 3.1 Package Document Conformance



*  It MUST honor all presentation logic expressed through the Package Document [EPUB-33] (e.g., the reading order, fallback chains, page progression direction and fixed layouts).

*  It MUST process the Package Document in conformance with all Reading System conformance constraints expressed in § 3.2 Package Document.

*  It SHOULD process rendering metadata, as expressed in § 10.2 Package Rendering Metadata.

*  It MUST process fixed layout metadata, as expressed in § 6.2 Fixed-Layout Properties.

*  It MUST ignore proprietary metadata properties that pertain to layout expressions if they conflict behaviorally with the property semantics defined in § 6.2 Fixed-Layout Properties.

*  It MUST NOT use any resources not listed in the Package Document in the processing of the Package (e.g., META-INF files [EPUB-33]).
    * package-unlisted-resources-001.epub



### 3.2 Package Document Processing


#### 3.2.1 Metadata

##### White Space

* Reading Systems MUST trim all leading and trailing white space [XML] from Dublin Core element values before processing.

    * package-whitespace-001.epub

* Unless an individual property explicitly defines a different white space normalization algorithm, Reading Systems MUST trim all leading and trailing white space [XML] from meta element values before further processing them.

##### The title element

*   Reading Systems MUST recognize the first title element in document order as the main title of the EPUB Publication (i.e., the primary one to present to users). This specification does not define how to process additional title elements.

    * package-title-display-001.epub

##### The creator element

* When determining display priority, Reading Systems MUST use the document order of creator elements in the metadata section, where the first creator element encountered is the primary creator. If a Reading System exposes creator metadata to the user, it SHOULD include all the creators listed in the metadata section whenever possible (e.g., when not constrained by display considerations).
    * package-creator-order-001.epub

##### The meta element

* If a Reading System does not recognize the scheme attribute value, it SHOULD treat the value of the element as a string.

* Reading Systems SHOULD ignore all meta elements whose property attributes define expressions they do not recognize. 

* A Reading System MUST NOT fail when encountering unknown expressions.

     * package-ignore-unknown-meta-001.epub


##### The link element

Retrieval of Remote Resources is OPTIONAL.

Reading System do not have to use or present linked resources, even if they recognize the relationship defined in the rel attribute.

  In the case of a linked metadata record [EPUB-33], Reading Systems MUST NOT skip processing the metadata expressed in the Package Document and only use the information expressed in the record. Reading Systems MAY compile metadata from multiple linked records; they do not have to select only one record.

When it comes to resolving discrepancies and conflicts between metadata expressed in the Package Document and in linked metadata records, Reading Systems MUST use the document order of link elements in the Package Document to establish precedence (i.e., metadata in the first linked record encountered has the highest precedence and metadata in the Package Document the lowest, regardless of whether the link elements occur before, within or after the package metadata elements).

Reading Systems MUST ignore any instructions contained in linked resources related to the layout and rendering of the EPUB Publication.

#### 3.2.2 Manifest

##### The item element

* When an href attribute contains a relative IRI, Reading Systems MUST use the IRI of the Package Document as the base when resolving to an absolute IRI.

    * item-iri-001.epub (like every epub, uses a relative IRI)


* Reading Systems MAY optimize the rendering depending on the properties set in the properties attribute (e.g., disable a rendering process or use a fallback). 

* Reading Systems MUST ignore all descriptive metadata properties that they do not recognize.

    * unknown-properties-001.epub (weird properties attribute on item)
    * https://github.com/w3c/epub-specs/issues/1475

* A Reading System that does not support the Media Type of a given Publication Resource MUST traverse the fallback chain until it has identified at least one supported Publication Resource to use in place of the unsupported resource. 

    * https://github.com/w3c/epub-specs/issues/1464



* If the Reading System supports multiple Publication Resources in the fallback chain, it MAY select the resource to use based on specific properties [EPUB-33] of that resource, otherwise it SHOULD honor the Author's preferred fallback order. 

* If a Reading System does not support any resource in the fallback chain, it MUST alert the reader that content could not be displayed.

    * manifest-fallback-005.epub (DMG falls back to PSD; bad results in many reading systems)



##### Manifest fallbacks

* When manifest fallbacks [EPUB-33] are provided for Top-level Content Documents, Reading Systems MAY choose from the available options in order to find the optimal version to render in a given context (e.g., by inspecting the properties attribute for each).

#### 3.2.3 Spine

##### The Spine Element

* Reading Systems MUST provide a means of rendering the EPUB Publication in the order defined in the spine, which includes: 1) recognizing the first primary itemref as the beginning of the default reading order; and, 2) rendering successive primary items in the order given in the spine.

    * spine-order-001.epub (make sure chapters occur in order)

* When the default value of the page-progression-direction attribute is specified, the Reading System can choose the rendering direction. The default value MUST be assumed when the attribute is not specified. In this case, the reading system SHOULD choose a default page-progression-direction value based on the first language element.

    * page-progression-001.epub (make sure ppd="ltr" works)
    * page-progression-002.epub (make sure ppd="rtl" works)
    * page-progression-003.epub (no ppd attribute, lang="ar"; should be rtl)
    
* Reading Systems MUST ignore the page progression direction defined in pre-paginated XHTML Content Documents. The page-progression-direction attribute defines the flow direction from one fixed-layout page to the next.

    * page-progression-004.epub (ppd="ltr"; all FXL content docs are dir="rtl")


##### The Itemref Element

* When rendering an EPUB Publication, a Reading System MAY either suppress non-linear content so that it does not appear in the default reading order, or ignore the linear attribute to provide users access to the entire content of the EPUB Publication. This specification does not mandate which model Reading Systems have to use. A Reading System MAY also provide the option for users to toggle between the two models.

    * linear-reachable-001.epub (make sure link to linear="no" spine item works)

* Reading Systems MUST ignore all metadata properties expressed in the properties attribute that they do not recognize.

    * unknown-properties-002.epub (weird properties attribute on itemref)


#### 3.2.4 Collections

In the context of this specification, support for collections in Reading Systems is OPTIONAL. Reading Systems MUST ignore collection elements that define unrecognized roles.

    * unknown-collections-001.epub (collection with random role attribute)
    
    
### 3.3 Publication Identifiers


#### Unique Identifiers

* Reading Systems MUST NOT depend on the Unique Identifier being unique to one and only one EPUB Publication. Determining whether two EPUB Publications with the same Unique Identifier represent different versions of the same publication, or different publications, might require inspecting other metadata, such as the titles or authors.

    * publication-identifier-001A.epub (two epubs with the same unique id)
    * publication-identifier-001B.epub


