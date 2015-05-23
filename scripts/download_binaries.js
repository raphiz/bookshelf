var http = require('http');
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
    var downloaded = path.basename(source),
        file = fs.createWriteStream(downloaded);
    console.log("Downloading....");
    
    http.get(source, function(response) {
        response.pipe(file);
        response.on('end', function() {
            cb(downloaded);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });

}


var plattform = "32",
    destination = 'bin/';

fs.mkdirSync(destination);

// Download and "install" poppler utils
download('http://gd.tuwien.ac.at/publishing/xpdf/xpdfbin-win-3.03.zip', function(downloaded){
    fs.createReadStream(downloaded)
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        var fileName = entry.path;
        
        // Extract all binaries into the bin directory
        if (fileName.startsWith('xpdfbin-win-3.03/bin32/') && entry.type == "File") {
            entry.pipe(fs.createWriteStream(destination  + fileName.split('/')[2]));
        } else {
          entry.autodrain();
       }
      })
      .on('finish', function(){
          console.log("cleaning up...")
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
        
//        if (fileName.startsWith('ImageMagick-6.9.1-2/images/') || fileName.startsWith('ImageMagick-6.9.1-2/www/')) {
        if(fileName == "ImageMagick-6.9.1-2/identify.exe" || fileName == "ImageMagick-6.9.1-2/convert.exe"){
            console.log(fileName);
            entry.pipe(fs.createWriteStream(destination  + fileName.split('/')[1]));
        }else{
    //     console.log(fileName); 
        entry.autodrain();
        }
          
       
      })
      .on('finish', function(){
          console.log("cleaning up...")
          fs.unlink(downloaded);
      });
});

