#!/bin/sh

# Loop through all subdirectories
for dir in `ls` ; do
    # Check if it's actually a directory (handles case where no subdirs exist)
    if [ -d "$dir" ]; then
        echo "====== Generating epub for $dir ======"
        (cd $dir; zip -X ../$dir.epub mimetype; zip -rDX9 ../$dir.epub * -x mimetype -x \*.DS_STORE)
    fi
done

