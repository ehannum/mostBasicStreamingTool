'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var querystring = require('querystring');
var http = require('http');
var server = http.Server(app);
var path = require('path');

var fs = require('fs');

// -- SERVE STATIC FILES and JSON

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// -- BUILD VIDEO LIBRARY

var library = {};

var isVideoFile = function (name) {
  return name.match(/mp4$|avi$|mov$/);
};

var crawlFolder = function (dirName) {
  fs.readdir(dirName, function (err, files) {
    if (err) {
      console.log('Error reading directory ' + dirName + '!');
      return;
    }

    for (var i = 0; i < files.length; i++) {
      let file = files[i];
      fs.stat(dirName + '/' + file, function (err, stats) {
        if (stats.isDirectory()) {
          crawlFolder(dirName + '/' + file);
        } else if (stats.isFile() && isVideoFile(file)) {
          var filename = file.split('.');
          library[filename[0]] = {path: dirName + '/' + file, ext: filename[1]};
        }
      });
    }

  });
};

crawlFolder('../videos');

// -- STREAM VIDEO

app.get('/video', function (req, res) {
  var args = req.url.split('?');
  var video = library[args[1]];

  var stream = fs.createReadStream(video.path);
  res.writeHead(200, {'Content-Type': 'video/' + video.ext});

  stream.pipe(res);
});

app.get('/list', function (req, res) {
  res.send(Object.keys(library));
});

// -- START SERVER

var port = process.env.PORT || 3030;
console.log('Listening on port', port);
server.listen(port);
