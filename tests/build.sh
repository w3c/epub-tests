#!/bin/bash

# create an EPUB from an HTML test file
# usage: build.sh [path to HTML file]
# started by Dave Cramer 19 November 2020

HTMLFILE=$1

my_name="$(basename $HTMLFILE)" 

title="${my_name%.*}"


extension="${my_name##*.}"

echo ${extension}

FOLDER=${title}

mkdir ${FOLDER}

echo ${FOLDER}

mkdir ${FOLDER}/OPS
mkdir ${FOLDER}/META-INF



if [ ${extension} = 'opf' ] ; then

echo "found opf"

cp $HTMLFILE ${FOLDER}/OPS/package.opf

cp "common/content_001.xhtml" ${FOLDER}/OPS/content_001.xhtml



TESTT=xpath ${FOLDER}/OPS/package.opf "*[local-name()='meta'/@test]"

echo ${FOLDER}/OPS/package.opf



else

cp $HTMLFILE ${FOLDER}/OPS/content_001.xhtml


cp "common/package.opf" ${FOLDER}/OPS/package.opf

fi 


cp "common/nav.xhtml" ${FOLDER}/OPS/nav.xhtml
cp "common/mimetype" ${FOLDER}/mimetype
cp "common/container.xml" ${FOLDER}/META-INF/container.xml




# zip -v0X ${FOLDER} mimetype

# zip -vr ${FOLDER} * -x ${FOLDER} mimetype -x "*.DS_Store"

# mv ${FOLDER}.zip ${FOLDER}.epub
 
# java -jar /Users/cramerd/xml/library/epubcheck.jar $FOLDER.epub
