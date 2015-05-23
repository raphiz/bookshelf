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

// Download and "install" imagemagick
download('http://www.imagemagick.org/download/binaries/ImageMagick-6.9.1-2-Q16-x86-windows.zip', function(downloaded){
    fs.createReadStream(downloaded)
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        var fileName = entry.path;
        
        // Extract all binaries into the bin directory
        if(fileName == "ImageMagick-6.9.1-2/identify.exe" || fileName == "ImageMagick-6.9.1-2/convert.exe"){
            entry.pipe(fs.createWriteStream(destination  + fileName.split('/')[1]));
        }else{
            entry.autodrain();
        }
          
       
      })
      .on('finish', function(){
          fs.unlink(downloaded);
          console.log("ImageMagick installed")
      });
});
