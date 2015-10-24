var Hapi = require('hapi');
var routes = require('./server/routes');

var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});
server.register([require('inert'), require('vision')], function(err) {

	if (err) {
        throw err;
    }

    server.views({
	    engines: { jade: require('jade') },
	    path: __dirname + '/templates'
	});
}); 


server.route(routes(server));

server.start(function () {

    console.log('Server running at:', server.info.uri);
});