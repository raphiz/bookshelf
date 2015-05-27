var pdfInfo = require("./resize/PdfInfo.js"),
    helpers = require("./resize/helpers"),
    console = require("console"),
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

function resize(source, working_dir, dimensionFromPage, ignore, memory, destination) {
    var numOfPages = pdfInfo.numberOfPages(source),
        zero = helpers.fillZeros(numOfPages);
        
    if (numOfPages < 1) {
        console.log("At least 2 Pages are required")
        return false;
    }

    // TODO: keep md5sum to be faster!
    if (harmonisationRequired(source, numOfPages) !== true) {
        console.log("No harmonisation required!")
        return true;
    }
    
    // If the dimensionFromPage is bigger than the number of pages or
    // smaller than 1 or ignored, do not continue.
    if (dimensionFromPage > numOfPages || dimensionFromPage < 1 ||  ignore.indexOf(dimensionFromPage) !== -1) {
        console.log("Can't take dimension from non-existing page!")
        return;
    }
    
    helpers.cleanUpWorkspace(working_dir);
    
    extractPages(source, working_dir);
    deleteIgnoredPages(zero, working_dir, ignore);
    
    resizePages(zero, dimensionFromPage, working_dir);
    
    createPdf(memory, working_dir, destination);
}

function extractPages(source, working_dir){
    console.log("Extracting PDF....");
    helpers.call('pdftoppm', ['-png', source, 'page'], {cwd: working_dir});
}

function deleteIgnoredPages(zero, working_dir, ignore){
    console.log("Delete ignored pages...");
    for (var i in ignore) {
        var val = helpers.imageName(zero, working_dir, ignore[i]);
        fs.unlinkSync(val)
        // TODO: debug only
        console.log("- Page " + ignore[i] + " deleted");
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
    
    console.log("Target dimension is:" + target);
    
    for (i in files) {
        file = path.join(working_dir, files[i]);
        // If no image, skip
        if(file.substr(-3) !== "png") {
            continue;
        }
        
        curr = helpers.imageDimension(file);
        if(helpers.compareDimensions(curr, dimension)) {
            // DEBUG ONLY
            console.log("Resizing "+ file + "...");
            helpers.call('convert', [file, '-resize', target, file]);
        }else{
            // DEBUG ONLY
            console.log("- Skipping " + file);
        }
    }
}

function createPdf(memory, working_dir, destination) {
    var files = fs.readdirSync(working_dir),
        args = ['-limit', 'memory', memory+'MiB'].concat(files).concat([destination]);
    console.log("Create target PDF");
    helpers.call('convert', args, {cwd: working_dir});
}

resize(
        path.resolve("doc.pdf"), // Source 
        path.resolve("tmp/"), // Working directory
        2,  // The page to get the dimensions from
        [1], // Ignored pages 
        256, // Memory limit in MB 
        path.resolve("result.pdf") // Destination file
);