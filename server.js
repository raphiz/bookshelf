// TODO: download binarys if not yet here... (imagemagicks, poppler-utils)

var express = require('express'),
    fs = require('fs'),
    ini = require('ini'),
    console = require('console')

// Create book directory if it does not exist
if(fs.existsSync('cache/') !== true) {
    fs.mkdir('cache/')
}


var app = express();

// Static routs to public & documents folder
app.use('/', express.static('public'));
app.use('/documents', express.static('cache'));
app.use('/log', express.static('status.log'));


// List all available books and return them as json
app.get('/book/:name', function (req, res) {
    var book = req.params.name,
        inipath = 'cache/' + book + '/info.ini',
        config = ini.parse(fs.readFileSync(inipath, 'utf-8'))

    config._path = book;

    res.json(config);
});

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
