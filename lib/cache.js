var fs = require("fs"),
    extract = require("./extract"),
    helpers = require("./helpers"),
    ini = require("ini"),
    path = require("path"),
    md5 = require('MD5'),
    rimraf = require("rimraf");

/**
 * This is the 'main' caching method. It "caches" all documents from the documents
 * directory into a cache directory.
 */
function load () {
    var cacheDir = path.resolve('cache') + '/',
        documentsDir = path.resolve('documents') + '/',
        books = getDocumentsFromDir(documentsDir),
        cached = getCached(cacheDir, books),
        book,
        i;

    // Delete the status.log if it does exist
    if(fs.exists('status.log')) {
        fs.unlinkSync('status.log');
    }
    // create empty log file
    fs.closeSync(fs.openSync('status.log', 'w'));

    // For each book in the documents, check if they are cached and process if not
    for (i = 0; i < books.length; i++) {
        book = books[i];

        if(cached.indexOf(book) < 0 || hasChanged(cached, book)) {
           cache(book) ;
        }else {
            updateMetadata(book)
            console.log(book + " has not changed")
        }
        fs.unlinkSync('status.log');
    }
}

/**
 * Caches the given book. This is done by calculating md5 sums(of the parameters
 * as well as the source PDF), extracting pdf pages, removing possibly ignored
 * pages, harmonize the page sizes and copying the cover image.
 */
function cache(book){
    var config = loadBookConfig(basePath(book)),
        pdfPath = basePath(book) + config.file,
        target_dir = cachedPath(book),
        ignored =  [];

    // Calculate checksums...
    config.file_checksum = md5sumFile(pdfPath);
    config.parameter_checksum = md5sumConfig(config);

    // Create book directory (remove the possibly existing directory)
    if(fs.existsSync(cachedPath(book)) === true) {
        rimraf.sync(cachedPath(book));
    }

    // Convert the ignored attribute into a list...
    if(config.ignored) {
        ignored = config.ignored.split(',');
    }

    // extract and resize the data...
    var res = extract(
            pdfPath, // Source
            path.resolve("tmp/"), // Working directory
            config,
            target_dir
    );

    // Check the result
    if(res !== true) { // Error
        helpers.log("Failed to process file " + pdfPath + " : " + res )
        return
    }

    // copy the cover
    fs.createReadStream(basePath(book) + config.cover)
        .pipe(fs.createWriteStream(cachedPath(book) + config.cover));
    // Save the cached config
    fs.writeFileSync(cachedPath(book) + 'info.ini', ini.stringify(config))
}

function hasChanged(book) {
    var config = loadBookConfig(basePath(book)),
        cached_config = loadBookConfig(cachedPath(book)),
        pdfPath = basePath(book) + config.file,
        file_checksum = md5sumFile(pdfPath),
        parameter_checksum = md5(config.ignored + config.dimensionsFrom);

        if( file_checksum !== cached_config.file_checksum){
            helpers.log("The source file for book " + book + " has changed")
            return true;
        } else if(parameter_checksum !== cached_config.parameter_checksum) {
            helpers.log("One or more parameters for book " + book + " have changed")
            return true;
        }
        return false;
}

/**
 * This utility method updates the cached metadata. This method is called if
 * neither the PDF file nor any modification parameters have changed.
 */
function updateMetadata(book) {
    var config = loadBookConfig(basePath(book)),
        cached_config = loadBookConfig(cachedPath(book));

    config.file_checksum = cached_config.file_checksum
    config.parameter_checksum = cached_config.parameter_checksum

    fs.writeFileSync(cachedPath(book) + 'info.ini', ini.stringify(config))
}

/**
 * Returns all books that are currently cached. This method does also remove
 * obsolete ones.
 */
function getCached(cacheDir, books){
    var cached = fs.readdirSync(cacheDir),
        i,
        cachedBook;

    // Go through the cached documents and remove those who are obsolete
    for (i = 0; i < cached.length; i++) {
        cachedBook = cached[i];
        if (books.indexOf(cachedBook) < 0) {
            delete cached[i];
            console.log("Cached " + cachedBook + " is obsolete!")
            rimraf.sync(cacheDir + cachedBook);
        } // if
    } // for
    return helpers.cleanArray(cached);
}


/**
 *  Returns the absolute path to the given book folder
 */
function basePath(book){
    return path.resolve('documents/' + book ) + '/';
}

/**
 *  Returns the absolute path to the given book cache folder
 */
function cachedPath(book){
    return path.resolve('cache/' + book ) + '/';
}

/**
 * Parses the book configuration in the given book directory.
 */
function loadBookConfig(path) {
    var iniPath = path + '/info.ini';
    return ini.parse(fs.readFileSync(iniPath, 'utf-8'))
}

/**
 * Calculates the md5 sum of the given file. This is done using a thrid-party
 * binary - on unix systems md5sum and on windows systems the md5 binary.
 *
 * @param filename the path to the file to calculate the md5 sum for
 */
function md5sumFile(filename){
    var match,
        re = /([a-zA-Z0-9]{32}).*/,
        bin = "md5sum"

    if(process.platform === "win32") {
        bin = "md5"
    }

    response = helpers.call(bin, [filename]).toString()
    match = response.match(re)
    return match[1]
}

/**
 * Calculates the md5 sum of the configuration values that have an impact on the
 * extracted PDF data (eg. the ignored pages or the dimensionsFrom attribute)
 */
function md5sumConfig(config){
    return md5(config.ignored + config.dimensionsFrom)
}


/**
 * Returns all names of the folders withing the given directory
 */
function getDocumentsFromDir(documentsDir) {
    var books = fs.readdirSync(documentsDir);
    for (var i = 0; i < books.length; i++) {
        if(books[i] === '.gitkeep'){
            delete books[i];
            break
        }
    }
    return helpers.cleanArray(books)
}


// Call the load method
load()
