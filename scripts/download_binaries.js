var request = require('request'),
    fs = require('fs'),
    rimraf = require("rimraf"),
    path = require("path");


function download(source, target) {
  var downloaded = path.basename(source);
  request({uri: source})
      .pipe(fs.createWriteStream(downloaded))
      .on('close', function() {
        //cb(downloaded);
        var source = fs.createReadStream(downloaded);
        var dest = fs.createWriteStream(target);
        source.pipe(dest);
        source.on('end', function() {
            console.log(target + " installed!")
            fs.unlink(downloaded);
        });
      });
}

var destination = 'bin/';


// Clean up existing binaries
if(fs.existsSync(destination)) {
    rimraf.sync(destination);
}
fs.mkdirSync(destination);

// Binary originally provided by https://code.google.com/p/pdfbun/
// Download and "install" pdfinfo
download('http://goo.gl/Rfk6Tm', destination + 'pdfinfo.exe');

// Binary originally provided by https://code.google.com/p/pdfbun/
// Download and "install" pdftoppm
download('http://goo.gl/1uV3eh', destination + 'pdftoppm.exe');

// Binary originally provided by imagemagick.org
// Download and "install" identify.exe
download('http://goo.gl/OGrrK8', destination + 'identify.exe');

// Binary originally provided by imagemagick.org
// Download and "install" convert.exe
download('http://goo.gl/1MBVJS', destination + 'convert.exe');

// Binary originally provided by imagemagick.org
// Download and "install" vcomp100.dll
download('http://goo.gl/GTvwtF', destination + 'vcomp100.dll');

// Binary originally provided by https://www.fourmilab.ch/md5/
// Download and "install" md5.exe
download('http://goo.gl/z8Vzyd', destination + 'md5.exe');
