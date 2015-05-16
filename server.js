var express = require('express'),
    fs = require('fs')
    ini = require('ini'),
    console = require('console')
var app = express();

// Static routs to public & documents folder
app.use('/', express.static('public'));
app.use('/documents', express.static('documents'));

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

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);

});
