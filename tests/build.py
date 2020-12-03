# lets play around with python3
import os, sys, shutil
from bs4 import BeautifulSoup

# where am I?
dir_path = os.path.dirname(os.path.realpath(__file__))

# who called?


filename, file_extension = os.path.splitext(sys.argv[1])


# create directory for our test EPUB

test_folder_name = os.path.basename(filename)


if not os.path.isdir(test_folder_name):
  os.mkdir(test_folder_name)

# create needed EPUB directories

  os.mkdir(os.path.join(test_folder_name, 'OPS'))
  os.mkdir(os.path.join(test_folder_name, 'META-INF'))

# get ready to copy files
# where the generic files live

generic_package_file = 'common/package.opf'
generic_container_file = 'common/container.xml'
generic_mimetype_file = 'common/mimetype'
generic_nav_file = 'common/nav.xhtml'

# where the generic files should go

new_package_file = os.path.join(test_folder_name, 'OPS', 'package.opf')
new_container_file = os.path.join(test_folder_name, 'META-INF', 'container.xml')
new_mimetype_file = os.path.join(test_folder_name, 'mimetype')
new_nav_file = os.path.join(test_folder_name, 'OPS', 'nav.xhtml')
new_content_file = os.path.join(test_folder_name, 'OPS', 'content_001.xhtml')

# do the copying 

shutil.copy2(generic_package_file, new_package_file)
shutil.copy2(generic_container_file, new_container_file)
shutil.copy2(generic_mimetype_file, new_mimetype_file)
shutil.copy2(generic_nav_file, new_nav_file)
# copy the original HTML file 
shutil.copy2(sys.argv[1], new_content_file)
