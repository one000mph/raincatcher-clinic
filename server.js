var Hapi = require('hapi');
var routes = require('./server/routes');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('rain_db');

db.serialize(function () {
    db.run ("CREATE TABLE transmission (timestamp TEXT, signal_strength TEXT, network TEXT, gps_coords TEXT)")
})

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