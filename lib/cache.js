var fs = require("fs"),
    resize = require("./resize"),
    helpers = require("./helpers"),
    ini = require("ini"),
    path = require("path"),
    md5 = require('MD5'),
    rimraf = require("rimraf");


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


function basePath(book){
    return path.resolve('documents/' + book ) + '/';
}

function cachedPath(book){
    return path.resolve('cache/' + book ) + '/';
}

function loadBookConfig(book, path) {
    var iniPath = path + '/info.ini';
    return ini.parse(fs.readFileSync(iniPath, 'utf-8'))
}

function process(book){
    var config = loadBookConfig(book, basePath(book)),
        pdfPath = basePath(book) + config.file,
        target = cachedPath(book) + config.file,
        ignored =  [];
    // Calculate checksums...
    config.file_checksum = md5(fs.readFileSync(pdfPath));
    config.parameter_checksum = md5(config.ignored + config.dimensionsFrom);
    
    // Create book directory if it does not exist
    if(fs.existsSync(cachedPath(book)) !== true) {
        fs.mkdir(cachedPath(book))
    }
    
    // Convert the ignored attribute into a list...
    if(config.ignored) {
        ignored = config.ignored.split(',');
    }
    
    // do resize....
    var res = resize(
            pdfPath, // Source 
            path.resolve("tmp/"), // Working directory
            parseInt(config.dimensionsFrom) || 2,  // The page to get the dimensions from
            ignored, // Ignored pages 
            config.memoryLimit || 256, // Memory limit in MB 
            target // Destination file
    );
    
    // Validate
    if(res !== true) { // Error
        helpers.log("Failed to process file " + pdfPath + " : " + res )
        return
    }
    //copy cover...
    // TODO: resize...
    fs.createReadStream(basePath(book) + config.cover)
        .pipe(fs.createWriteStream(cachedPath(book) + config.cover));
    fs.writeFileSync(cachedPath(book) + 'info.ini', ini.stringify(config))
}

function hasChanged(book) {
    var config = loadBookConfig(book, basePath(book)),
        cached_config = loadBookConfig(book, cachedPath(book)),
        pdfPath = basePath(book) + config.file,
        file_checksum = md5(fs.readFileSync(pdfPath)),
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

function updateMetadata(book) {
    var config = loadBookConfig(book, basePath(book)),
        cached_config = loadBookConfig(book, cachedPath(book));
        
    config.file_checksum = cached_config.file_checksum
    config.parameter_checksum = cached_config.parameter_checksum
    
    fs.writeFileSync(cachedPath(book) + 'info.ini', ini.stringify(config))


}

function load () {
    var cacheDir = path.resolve('cache') + '/',
        documentsDir = path.resolve('documents') + '/',
        books = fs.readdirSync(documentsDir),
        cached = getCached(cacheDir, books),
        book,
        i;
    
    if(fs.exists('status.log')) {
        fs.unlinkSync('status.log');    
    }
    // create empty log file
    fs.closeSync(fs.openSync('status.log', 'w'));

    // For each book in the documents, check if they are cached and process if not
    for (i = 0; i < books.length; i++) {
        book = books[i];
        
        if(cached.indexOf(book) < 0 || hasChanged(cached, book)) {
           process(book) ;
        }else {
            updateMetadata(book)
            console.log(book + " has not changed")
        }
        fs.unlinkSync('status.log');
    }    
}

load()
