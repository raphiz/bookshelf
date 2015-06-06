var pdfInfo = require("./PdfInfo.js"),
    helpers = require("./helpers"),
    path = require("path"),
    fs = require("fs");


function harmonisationRequired(doc, numOfPages) {
    var dimension = pdfInfo.dimensionOfPage(doc, 1),
        i,
        curr;
    for (i = 2; i <= numOfPages; i++) {
        curr = pdfInfo.dimensionOfPage(doc, i);
        if(helpers.compareDimensions(dimension, curr)) {
            return true;
        }
    }
    return false;
}

module.exports = function(source, working_dir, dimensionFromPage, ignore, memory, destination) {
    var numOfPages = pdfInfo.numberOfPages(source),
        zero = helpers.fillZeros(numOfPages);
        
    if (numOfPages < 1) {
        return "At least 2 Pages are required";
    }
    
    // If the dimensionFromPage is bigger than the number of pages or
    // smaller than 1 or ignored, do not continue.
    if (dimensionFromPage > numOfPages || dimensionFromPage < 1 ||  ignore.indexOf(dimensionFromPage) !== -1) {
        return "Can't take dimension from non-existing page!";
    }
    if (harmonisationRequired(source, numOfPages) !== true && ignore.length === 0 ) {
        helpers.log("No harmonisation required - using original!")
        fs.createReadStream(source).pipe(fs.createWriteStream(destination));
        return true;
    }
    

    
    helpers.cleanUpWorkspace(working_dir);
    
    extractPages(source, working_dir);
    deleteIgnoredPages(zero, working_dir, ignore);
    
    resizePages(zero, dimensionFromPage, working_dir);
    
    createPdf(memory, working_dir, destination);
    return true;
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

function resizePages(zero, dimensionFromPage, working_dir) {
    var dimensionSource = helpers.imageName(zero,working_dir, dimensionFromPage),
        dimension = helpers.imageDimension(dimensionSource),
        target = dimension[0] + "x" + dimension[1] + "\!",
        files = fs.readdirSync(working_dir),
        i,
        file,
        curr;
    
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
            helpers.call('convert', [file, '-resize', target, file]);
        }else{
            // DEBUG ONLY
            helpers.log("- Skipping " + file);
        }
    }
}

function createPdf(memory, working_dir, destination) {
    var files = fs.readdirSync(working_dir),
        args = ['-limit', 'memory', memory+'MiB'].concat(files).concat([destination]);
    helpers.log("Create target PDF");
    helpers.call('convert', args, {cwd: working_dir});
}
