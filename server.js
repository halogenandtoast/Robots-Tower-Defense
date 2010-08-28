// var socketIO = require(__dirname+"/socketIO").socketIO,
//     app = require('express').createServer();
//
// app.get('/', function (req, res) {
//   res.send('oh hai');
// });
//
// var port = process.argv.length == 3 ? parseInt(process.argv[2]) : 80
// app.listen(port);
//
var http = require('http');

var server = http.createServer(function (req, res) {
      res.writeHead(200, { "Content-Type": "text/plain" })
        res.end("Hello world\n");
      });

    server.listen(80);
