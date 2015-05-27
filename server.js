// TODO: download binarys if not yet here... (imagemagicks, poppler-utils)

var express = require('express'),
    fs = require('fs'),
    ini = require('ini'),
    console = require('console')
var app = express();

// Static routs to public & documents folder
app.use('/', express.static('public'));
app.use('/documents', express.static('documents'));
app.use('/log', express.static('status.log'));

// List all available books and return them as json
app.get('/books', function (req, res) {
    var books = fs.readdirSync('documents');
    var result = [];
    for (var i = 0; i < books.length; i++) {
        var book = books[i];

        // Parse config (todo: make filesafe!)
        var config = ini.parse(fs.readFileSync('documents/' + book + '/info.ini', 'utf-8'))
        config._path = book;
        result.push(config);
    }
    res.json(result);
});

var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);

});

var books = fs.readdirSync('documents');
var result = [];
for (var i = 0; i < books.length; i++) {
    var book = books[i];

    // Parse config (todo: make filesafe!)
    var config = ini.parse(fs.readFileSync('documents/' + book + '/info.ini', 'utf-8'))
    // TODO: has md sum? if so, check if it is OK, if not, call resize
    // Write log into status.log and serve it via node
}