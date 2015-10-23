#!/usr/bin/node

var cgi = require('./cgi');
var server = cgi.createServer(function (request, response) {
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.write('This is CGI!');
	response.end();
});
server.listen();
