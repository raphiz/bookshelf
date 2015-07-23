var child_process = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    util = require("util"),
    rimraf = require("rimraf");

exports.call = function(cmd, params, opts, attempts) {
    attempts = attempts || 1
    for (var i = 0; i < attempts; i++) {
        try {
            opts = opts || {}
        
            if(process.platform === "win32") {
                cmd = path.join(process.cwd(), 'bin', cmd);
            }
            
            var res = child_process.spawnSync(cmd, params, opts)
            if(res.error){
                throw res.error
            }
            return res.stdout;
        } catch (e) {
            exports.log(util.format('Failed to call %s %s (%s). attempts left: %s', cmd, params, e, attempts))
        }
    }
    
    var msg = util.format("Failed to execute %s %s", cmd, params);
    exports.log(msg);
    throw msg;
}

exports.log = function(msg) {
    console.log('>>'+msg)
    fs.appendFileSync('status.log', msg + "\n")
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
    fs.mkdirSync(working_dir);
}

exports.imageName = function(zero, working_dir, idx){
    idx = (String(zero) + String(idx)).slice(zero.length*-1)
    return path.join(working_dir, util.format("%s-%s.png", 'page', idx));
}

exports.imageDimension = function(filename){
    console.log(filename)
    console.log(String(exports.call('identify', ['-format', '%w', filename])).trim())
    var w = String(exports.call('identify', ['-format', '%w', filename])).trim(),
        h = String(exports.call('identify', ['-format', '%h', filename])).trim();
    return [w,h]
}

exports.compareDimensions = function(first, second) {
    return (first[0] !== second[0] || first[1] !== second[1]);
}

exports.cleanArray = function(actual){
  var newArray = new Array();
  for(var i = 0; i<actual.length; i++){
      if (actual[i]){
        newArray.push(actual[i]);
    }
  }
  return newArray;
}
