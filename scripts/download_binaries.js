var request = require('request');
var https = require('https');
var fs = require('fs');
var unzip = require("unzip");
var path = require("path");

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}



function download(source, cb) {
  var downloaded = path.basename(source);
  request({uri: source})
      .pipe(fs.createWriteStream(downloaded))
      .on('close', function() {
        cb(downloaded);
      });
}

var plattform = "32",
    destination = 'bin/';

fs.mkdirSync(destination);


// Binary originally provided by https://code.google.com/p/pdfbun/
// Download and "install" pdfinfo
download('http://goo.gl/Rfk6Tm', function(downloaded){
    var source = fs.createReadStream(downloaded);
    var dest = fs.createWriteStream('bin/pdfinfo.exe');
    source.pipe(dest);
    source.on('end', function() {
        console.log("pdfinfo installed!")
        fs.unlink(downloaded);
    });
});

// Binary originally provided by https://code.google.com/p/pdfbun/
// Download and "install" pdftoppm
download('http://goo.gl/1uV3eh', function(downloaded){
    var source = fs.createReadStream(downloaded);
    var dest = fs.createWriteStream('bin/pdftoppm.exe');
    source.pipe(dest);
    source.on('end', function() {
        console.log("pdftoppm installed!")
        fs.unlink(downloaded);
    });
});

// Binary originally provided by imagemagick.org
// Download and "install" identify.exe
download('http://goo.gl/OGrrK8', function(downloaded){
    var source = fs.createReadStream(downloaded);
    var dest = fs.createWriteStream('bin/identify.exe');
    source.pipe(dest);
    source.on('end', function() {
        console.log("identify installed!")
        fs.unlink(downloaded);
    });
});

// Binary originally provided by imagemagick.org
// Download and "install" convert.exe
download('http://goo.gl/1MBVJS', function(downloaded){
    var source = fs.createReadStream(downloaded);
    var dest = fs.createWriteStream('bin/convert.exe');
    source.pipe(dest);
    source.on('end', function() {
        console.log("convert installed!")
        fs.unlink(downloaded);
    });
});
