# lets play around with python3
import os, sys, shutil
from bs4 import BeautifulSoup
from lxml import etree
from lxml.html.soupparser import fromstring

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
generic_content_file = 'common/content_001.xhtml'

# where the generic files should go

new_package_file = os.path.join(test_folder_name, 'OPS', 'package.opf')
new_container_file = os.path.join(test_folder_name, 'META-INF', 'container.xml')
new_mimetype_file = os.path.join(test_folder_name, 'mimetype')
new_nav_file = os.path.join(test_folder_name, 'OPS', 'nav.xhtml')
new_content_file = os.path.join(test_folder_name, 'OPS', 'content_001.xhtml')

# do the copying 

if file_extension == '.html':
  shutil.copy2(generic_package_file, new_package_file)
  # copy the original HTML file 
  shutil.copy2(sys.argv[1], new_content_file)
  with open(new_content_file) as fp:
   soup = BeautifulSoup(fp, 'html.parser')
   
   assert_statement = soup.find("meta", {"name":"assert"})['content']
   test_title = soup.title.string
  
   print(test_title)
   
  
   

if file_extension == '.opf':
  shutil.copy2(generic_content_file, new_content_file)
  # copy the original Package file 
  shutil.copy2(sys.argv[1], new_package_file)
  
  # read info from package file using the xml parser
  with open(new_package_file) as fp:
   package_file = BeautifulSoup(fp, 'lxml')
   test_statement = package_file.find("meta", {"name":"test"})['content']
   assert_statement = package_file.find("meta", {"name":"assert"})['content']
   print(test_statement)
   with open (new_content_file) as lp:
     content_file =  BeautifulSoup(lp, 'html.parser')
     content_file.p.string = test_statement
     new_assert_meta = content_file.new_tag('meta', content=assert_statement) #need to work on getting 'name' attribute too but it's complicated because of Soup reserving "name"
     print(new_assert_meta)
     # content_file.meta.append(new_assert_meta)
     
     print(content_file.p)
     # need to save our changes... could this be easier
     new_html = content_file.prettify("utf-8")
     lp.close()
     with open (new_content_file, "wb") as file:
       file.write(new_html)
     
  
shutil.copy2(generic_container_file, new_container_file)
shutil.copy2(generic_mimetype_file, new_mimetype_file)
shutil.copy2(generic_nav_file, new_nav_file)


