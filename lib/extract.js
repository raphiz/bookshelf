var pdfInfo = require("./PdfInfo.js"),
    helpers = require("./helpers"),
    path = require("path"),
    fs = require("fs-extended");

// Export the main function
module.exports = function(source, working_dir, config, destination) {
    var dimensionFromPage = parseInt(config.dimensionsFrom) || -1,
        ignore = [];

    // Store the number of pages and zeros into the configuration
    config.numOfPages = pdfInfo.numberOfPages(source),
    config.zero = helpers.fillZeros(config.numOfPages);

    // Abort if pdf has less that two pages
    if (config.numOfPages < 2) {
        return "At least 2 Pages are required";
    }

    // If the config defines ignored pages, read it
    if(config.ignored) {
        ignore = config.ignored.split(',');
    }


    if (dimensionFromPage === -1) {
        dimensionFromPage = findSmallestPage(source, config.numOfPages, config.ignored)
    }


    // If the dimensionFromPage is bigger than the number of pages or
    // smaller than 1 or ignored, do not continue.
    if (dimensionFromPage > config.numOfPages || dimensionFromPage < 1 ||  ignore.indexOf(dimensionFromPage) !== -1) {
        return "Can't take dimension from non-existing page!";
    }

    // Subtract the amount of ignored files from the numberOfPages
    config.numOfPages = config.numOfPages - ignore.length

    // Create a new, emtpy workspace
    helpers.cleanUpWorkspace(working_dir);

    // Extract the pages into images, delete the ignored ones and resize them.
    extractPages(source, working_dir);
    deleteIgnoredPages(config.zero, working_dir, ignore);
    resizePages(config.zero, dimensionFromPage, working_dir, config);

    // Create the target directory
    fs.mkdir(destination)

    // Move the temporary workspace to the destination
    pages = fs.readdirSync(working_dir).sort()
    for (var i = 0; i < pages.length; i++) {
        fs.moveFileSync(working_dir + '/' + pages[i],
            helpers.imageName(config.zero, destination, i));
    }
    // Yay, that's it!
    return true;
}

function findSmallestPage(filename, numOfPages, ignored){
    var x = Number.MAX_VALUE,
        y = Number.MAX_VALUE,
        smallest = 0,
        dimension;

    //for each page
    for (var pageno = 1; pageno <= numOfPages; pageno++) {
        if(ignored.indexOf(pageno) !== -1) {
            continue
        }
        dimension = pdfInfo.dimensionOfPage(filename, pageno)
        if(dimension[0] < x || dimension[1] < y) {
            smallest = pageno
            x = dimension[0]
            y = dimension[1]
        }
    }
    helpers.log("Using dimensions of page " + smallest);
    return smallest
}

function extractPages(source, working_dir){
    helpers.log("Extracting PDF....");
    helpers.call('pdftoppm', ['-png', source, 'page'], {cwd: working_dir});
}

function deleteIgnoredPages(zero, working_dir, ignore){
    helpers.log("Delete ignored pages...");
    for (var i in ignore) {
        var val = helpers.imageName(zero, working_dir, ignore[i]);
        fs.unlinkSync(val)
        // TODO: debug only
        helpers.log("- Page " + ignore[i] + " deleted");
    }
}

function resizePages(zero, dimensionFromPage, working_dir, config) {
    var dimensionSource = helpers.imageName(zero,working_dir, dimensionFromPage),
        dimension = helpers.imageDimension(dimensionSource),
        target,
        files = fs.readdirSync(working_dir),
        i,
        file,
        curr;

    //  Calculate the dimension ratio - will later be used for rendering
    config.ratio = dimension[1] / dimension[0]
    config.ratio2 = dimension[0] / dimension[1]

    maxpix = 1000
    if(dimension[1] > maxpix) {
        dimension[0] = config.ratio2 * maxpix
        dimension[1] = maxpix
    }
    if (dimension[0] > maxpix) {
        dimension[0] = maxpix
        dimension[1] = config.ratio * maxpix
    }

    target = dimension[0] + "x" + dimension[1] + "\!"

    helpers.log("Target dimension is:" + target);

    for (i in files) {
        file = path.join(working_dir, files[i]);
        // If no image, skip
        if(file.substr(-3) !== "png") {
            continue;
        }
        curr = helpers.imageDimension(file);
        if(helpers.compareDimensions(curr, dimension)) {
            // DEBUG ONLY
            helpers.log("Resizing "+ file + "...");
            helpers.call('convert', [file, '-resize', target, file], {timeout: 30000}, 3);
        }else{
            // DEBUG ONLY
            helpers.log("- Skipping " + file);
        }
    }
}
