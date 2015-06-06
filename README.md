# Bookstation

The intention of this "bookstation" project is to allow visitors in museums to 
browse through old books. There are thousands of free scanned books available on [archive.org](https://archive.org/),
[e-rara.ch](http://www.e-rara.ch/) etc. - but no simple and cheap way to exhibit them. This tool does exactly this. But that's not all - 
it does also harmonize the dimensions of the scanned documents - which is is an issue with almost every
scann.

![Screenshot of an open book](docs/images/screenshot1.png)

If you have any questions regarding this project, feel free to write me an [E-Mail](http://raphael.li/contact.html).

## Installation

### Requirements
* Nodejs == 0.12
* Bower
* Git
* Google Chrome / Chromium
* imagemagick (not on windows)
* poppler-utils (not on windows)

### Setup

Run the following commands:

```
git clone https://github.com/raphiz/bookshelf.git
cd bookshelf/
npm install
bower install
npm start
```

There is a setup script for windows - which must be run after all above mentioned requirements are met.

More detailed installation instructions might follow soon.


## Configuration
If you want to add a new book, create a new subfolder in the documents/ directory.
Place the book cover and PDF version of the scanned book. Create a new file called `info.ini` - this one will
hold the metadata of our project. See the example below for details. 
```
title=A very fancy book title
author=The Author
year=1942
cover=cover.jpg
file=example.pdf

ignored=2,3,4
dimensionsFrom=1
memoryLimit=256
```

Note that the `title`, `author`, `year`, `cover` and `file` attributes are required.
The path provided in the attributes `cover` and `file` name are relative to the `info.ini` file.

The `ignored` attribute takes a comma separated list that removes unused pages from the document. 
All pages will be resized to the exact dimensions of the page provided in the  `dimensionsFrom` attribute.

The memoryLimit attribute is highly recommend to set to a reasonable size to prevent the program eating
up too much memory. 


## Roadmap
Ther are currently no plans to add new features. However, feel free to open 
issues or create pull requests.
