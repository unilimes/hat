var path = require('path');
var http = require('http');
var express = require('express');
var child = require('child_process');

var port = 3000;

var app = express();
var server = http.createServer(app);

app.use('/child', function (req, res) {

    var fork = child.fork(path.resolve(__dirname, 'process/calc.js'));

    fork.on( 'message', function(message) {

        console.log(message);

        res.json({
            status: true,
            message: 'Success'
        });

    });

    fork.on('error', function(error) {
        console.error(error.stack);
    });

    fork.on('exit', function() {
        console.log('process exited');
        fork.kill();
    });

    fork.send(JSON.stringify({
        count: 10000000000
    }));

});

app.use(express.static(path.join(__dirname, '../public')));

app.use('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

server.listen(port);

console.log('Server started on port ' + port);
