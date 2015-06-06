// TODO: download binarys if not yet here... (imagemagicks, poppler-utils)

var express = require('express'),
    fs = require('fs'),
    ini = require('ini'),
    console = require('console')
var app = express();

// Static routs to public & documents folder
app.use('/', express.static('public'));
app.use('/documents', express.static('cache'));
app.use('/log', express.static('status.log'));

// List all available books and return them as json
app.get('/books', function (req, res) {
    var books = fs.readdirSync('cache');
    var result = [];
    for (var i = 0; i < books.length; i++) {
        var book = books[i],
            inipath = 'cache/' + book + '/info.ini';
        
        if(
            fs.statSync('cache/' + book).isDirectory() && 
            fs.existsSync(inipath)
        ){
    
            // Parse config (todo: make filesafe!)
            var config = ini.parse(fs.readFileSync(inipath, 'utf-8'))
            config._path = book;
            result.push(config);
        }
    }
    res.json(result);
});

var spawn = require('child_process').spawn,
    cmd    = spawn('node', ['./lib/cache.js']);

cmd.stderr.on('data', function (data) {
  console.log('Error during conversion: ' + data);
});

cmd.on('close', function (code) {
  console.log('Conversion completed ' + code);
});


var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);

});
/*
var books = fs.readdirSync('documents');
var result = [];
for (var i = 0; i < books.length; i++) {
    var book = books[i];

    // Parse config (todo: make filesafe!)
    var basePath = path.resolve('documents/' + book ) + '/';

    var iniPath = basePath + '/info.ini';
    var iniContents = fs.readFileSync(iniPath, 'utf-8');
    var config = ini.parse(iniContents)
    var pdfPath = basePath + config.original;
    var target = basePath + 'compiled_' + config.original;
    // Calculate the checksum for the defined PDF file
    var fileChecksum = md5(fs.readFileSync(pdfPath));
    var parameterChecksum = md5(config.ignored + config.dimensionsFrom);

    // If the checksum is not equal to the calculated one, check if resizing is required
    // TODO: also make sure the target exists!
    if(config.fileChecksum !== fileChecksum || 
        config.parameterChecksum !== parameterChecksum ||
        fs.existsSync(target) !== true) {
        console.log("Checking required...")
        var ignored =  [];
        
        if(config.ignored) {
            ignored = config.ignored.split(',')
        }

        var res = resize(
                pdfPath, // Source 
                path.resolve("tmp/"), // Working directory
                config.dimensionsFrom || 2,  // The page to get the dimensions from
                ignored, // Ignored pages 
                config.memoryLimit || 256, // Memory limit in MB 
                target // Destination file
        );
        
        if(res !== true) { // Error
            config.error = res;
        }else {
            delete config.error
            config.parameterChecksum = parameterChecksum;
            config.fileChecksum = fileChecksum;
            // Override original and file value
            config.compiled = 'compiled_' + config.original;
        }        
        fs.writeFileSync(iniPath, ini.stringify(config))
    }
    // TODO: has md sum? if so, check if it is OK, if not, call resize
    // Write log into status.log and serve it via node
}
*/
