var socketIO = require(__dirname+"/vendor/socketIO").socketIO,
    app = require('express').createServer();

app.get('/', function (req, res) {
  res.send('oh hai');
});

var port = process.argv.length == 3 ? parseInt(process.argv[2]) : 80
app.listen(port);
