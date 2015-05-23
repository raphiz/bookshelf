var child_process = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    util = require("util"),
    rimraf = require("rimraf");

exports.call = function(cmd, params, opts) {
    // TODO: explode if exit code not OK
    opts = opts || {}
    if(process.platform == "win32"){
        cmd = "bin/" + cmd + ".exe";
    }
    var res = child_process.spawnSync(cmd, params, opts)
    //console.log(">>"+String(res.stderr));
    return res.stdout;
}

exports.fillZeros = function(numOfPages) {
    var zero = "";
    for (var i = 0; i < String(numOfPages).length ; i++) {
        zero += "0";
    }
    return zero;
}

exports.cleanUpWorkspace = function(working_dir) {
    if(fs.existsSync(working_dir)) {
        rimraf.sync(working_dir);
    }
    fs.mkdir(working_dir);
}

exports.imageName = function(zero, working_dir, idx){
    idx = (String(zero) + String(idx)).slice(zero.length*-1)
    return path.join(working_dir, util.format("%s-%s.png", 'page', idx));
}

exports.imageDimension = function(filename){
    console.log(filename);
    var w = String(exports.call('identify', ['-format', '%w', filename])).trim(),
        h = String(exports.call('identify', ['-format', '%h', filename])).trim();
    return [w,h]
}

exports.compareDimensions = function(first, second) {
    return (first[0] !== second[0] || first[1] !== second[1]);
}