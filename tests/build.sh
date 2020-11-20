#!/bin/bash

# create an EPUB from an HTML test file
# usage: build.sh [path to HTML file]
# started by Dave Cramer 19 November 2020

HTMLFILE=$1

my_name="$(basename $HTMLFILE)" 

title="${my_name%.*}"

FOLDER=${title}

mkdir ${FOLDER}

echo ${FOLDER}

mkdir ${FOLDER}/OPS
mkdir ${FOLDER}/META-INF

cp $HTMLFILE ${FOLDER}/OPS/content_001.xhtml

cp "common/nav.xhtml" ${FOLDER}/OPS/nav.xhtml

cp "common/mimetype" ${FOLDER}/mimetype

cp "common/container.xml" ${FOLDER}/META-INF/container.xml


cat > ${FOLDER}/OPS/package.opf <<- "EOF"
<?xml version='1.0' encoding='UTF-8'?>
<package xmlns='http://www.idpf.org/2007/opf' version='3.0' xml:lang='en' unique-identifier='q'>
<metadata xmlns:dc='http://purl.org/dc/elements/1.1/'>
  <dc:title id='title'>Title</dc:title>
  <dc:language>en</dc:language>
  <dc:identifier id='q'>NOID</dc:identifier>
  <meta property='dcterms:modified'>2020-11-19T00:00:00Z</meta>
</metadata>
<manifest>
  <item id='content_001'  href='content_001.xhtml' media-type='application/xhtml+xml'/>
  <item id='nav'  href='nav.xhtml' media-type='application/xhtml+xml' properties='nav'/>
</manifest>
<spine>
  <itemref idref='content_001' />
</spine>
</package>
EOF




# zip -v0X ${FOLDER} mimetype

# zip -vr ${FOLDER} * -x ${FOLDER} mimetype -x "*.DS_Store"

# mv ${FOLDER}.zip ${FOLDER}.epub
 
# java -jar /Users/cramerd/xml/library/epubcheck.jar $FOLDER.epub
