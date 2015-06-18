var helpers = require("./helpers");

exports.numberOfPages = function(doc){
     var re     = /Pages:\s*([0-9]*)/,
        output = helpers.call('pdfinfo', [doc]),
        match;

    if ((match = re.exec(output)) !== null) {
        return match[1]
    }
    // throw exception!
}

exports.dimensionOfPage = function(doc, pageNo) {
    var re     = /Page[^:]*:\s([0-9\.]*)\sx\s([0-9\.]*)/,
        output = helpers.call('pdfinfo', ['-f', pageNo,  '-l', pageNo, doc]),
        match;

    if ((match = re.exec(output)) !== null) {
        return [match[1], match[2]]
    }
    // throw exception!
}
