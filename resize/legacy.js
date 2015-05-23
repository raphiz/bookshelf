/*
function numberOfPages(doc){
     var re     = /Pages:\s*([0-9]*)/,
        output = call('pdfinfo', [doc]),
        match;

    if ((match = re.exec(output)) !== null) {
        return match[1]
    }
    // throw exception!
}


function call(cmd, params, opts) {
    // TODO: explode if exit code not OK
    opts = opts || {}
    var res = child_process.spawnSync(cmd, params, opts)
    //console.log(">>"+String(res.stderr));
    return res.stdout;
}

function pageDimesnion(doc, pageNo){
    var re     = /Page\s.*:\s([0-9]*)\sx\s([0-9]*)/,
        output = call('pdfinfo', ['-f', pageNo,  '-l', pageNo, doc]),
        match;

    if ((match = re.exec(output)) !== null) {
        return [match[1], match[2]] 
    }
    // throw exception!
}
function reqiresHarmonisation(doc){
    var numOfPages = numberOfPages(source),
        dimensions,
        curr,
        i;
    
    if (numOfPages < 1) {
        // throw exception!
    }
    
    dimensions = pageDimesnion(doc, 1);
    for (i = 2; i <= numOfPages; i++) {
        curr = pageDimesnion(doc, i);
        if(curr[0] !== dimensions[0] || curr[1] !== dimensions[1]) {
            return true;
        }
    }
    return false;
}


function imageDimension(filename){
    console.log(filename);
    var w = String(call('identify', ['-format', '%w', filename])).trim(),
        h = String(call('identify', ['-format', '%h', filename])).trim();
    return [w,h]
}


function imageName(zero, idx){
    idx = (String(zero) + String(idx)).slice(zero.length*-1)
    return path.join(working_dir, util.format("%s-%s.png", prefix, idx));
}


if(reqiresHarmonisation(source) !== true) {
    //EXIT!
    console.log("No harmonisation required!")
}

var numOfPages = numberOfPages(source),
    zero = "";
for (var i = 0;i<String(numOfPages).length;i++) {
    zero += "0";
}

if (dimensionFromPage > numOfPages) {
    // TODO: if excluded or negative!
    //EXIT
    console.log("Can't take dimension from non-existing page!")
}

// TODO: keep md5sum to be faster!


// Clean up working directory
if(fs.existsSync(working_dir)) {
    console.log("Cleaning up existing working directory...");
    rimraf.sync(working_dir);
}

fs.mkdir(working_dir);

console.log("Extracting PDF....");
call('pdftoppm', ['-png', source, prefix], {cwd: working_dir});

console.log("Delete ignored pages...");
for (var i in ignore) {
    var val = imageName(zero, ignore[i]);
    fs.unlinkSync(val)
    console.log(util.format("- Page %s deleted", ignore[i]));
}


var dimension = imageDimension(imageName(zero, dimensionFromPage)),
    target = util.format("%sx%s\!", dimension[0], dimension[1]);

console.log("Target dimension is:" + target);

var files = fs.readdirSync(working_dir);
for (var i in files) {
    var file = path.join(working_dir, files[i]);
    // If no image, skip
    if(file.substr(-3) !== "png") {
        continue;
    }
    
    var curr = imageDimension(file);
    if(curr[0] !== dimension[0] || curr[1] !== dimension[1]) {
        console.log("Resizing "+ file + "...");
        call('convert', [file, '-resize', target, file]);
    }else{
        console.log("- Skipping " + file);
    }
}

console.log("Create target PDF");
call('convert', ['-limit', 'memory', memory+'MiB'].concat(files).concat(["result.pdf"]),  {cwd: working_dir});
*/