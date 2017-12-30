console.log("Server started");
var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var app = express();

var server = http.Server(app);
var io = require('socket.io')(server);


server.listen(80);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/node_modules/')));
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

var searched = "";
var re = "";

function sendData(socket, result) {
    socket.emit("text", {
        'data': result,
        'searched': searched
    })
}

function bakeData(data, socket) {
    var word = data;
    re = new RegExp(searched, 'gi');
    var result = word.match(re);
    // Added timeout to make the graph more readable, works without them too
    // To see it working without timeout, uncomment below
    // if (result === null) {
    //     sendData(socket, 0);
    // }
    // else {
    //     sendData(socket, result.length);
    // }

    // And comment till else block below
    if (result === null) {
        setTimeout(function () {
            sendData(socket, 0);
        }, 200)
    }
    else {
        setTimeout(function () {
            sendData(socket, result.length);
        }, 200);
    }
}

io.on('connection', function (socket) {
    var text = [];

    // On connection, read text-file
    fs = require('fs');
    fs.readFile(path.join(__dirname, 'blabber.txt'), 'utf-8', function (err, data) {
        if (err) {
            console.log("Error reading file. ", err);
        }
        else {
            text = data.split("\n");
        }
    });


    var left = 0;
    var right = 30;
    // create a small cache of strings, which have a length less than 10
    var cache = [];
    socket.on("draw", function (data) {
        var search = data.new_search;
        if (search === "yes") {

        }
        searched = data.searched;
        // if length of cache is less than ten, update it
        if (cache.length < 10) {
            var pushed = 0;
            while (pushed < 30) {
                for (var j = left; j <= right; j++) {
                    if (text[j].length < 10) {
                        cache.push(text[j]);
                        pushed += 1;
                    }
                    if (pushed === 8) {
                        left += 30;
                        right += 30;
                        break;
                    }
                }
            }
            bakeData(cache[0], socket);
            cache.splice(0, 1);
        }
        else {
            bakeData(cache[0], socket);
            cache.splice(0, 1);
        }
    })
});