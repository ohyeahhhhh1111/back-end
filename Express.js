var express = require("express");
var http = require("http");
var app = express();
app.use(function(request, response, next) {
    console.log("In comes a " + request.method + " to " + request.url);
    next();
});
app.use(function(request, response, next) {
    var minute = (new Date()).getMinutes();
    if ((minute % 2) === 0) { // continue if it is on an even minute
    next();
    } else { // otherwise responds with an error code and stops
    response.statusCode = 403;
    response.end('Bad luck. Try again next time');
    }
});
app.use(function(request, response) { // only run if authorised
    response.end('Secret info: the password is "swordfish"!');
});

http.createServer(app).listen(3000);
