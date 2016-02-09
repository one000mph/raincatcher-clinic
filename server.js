var Hapi = require('hapi');
var routes = require('./server/routes');
var config = require('getconfig');

var accountSid = config.twilioAccountSID;
var authToken = config.twilioAuthToken;
var client = require('twilio')(accountSid, authToken);

var helpers = require('./server/helpers');

var server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: parseInt(process.env.PORT) || 8000
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

server.start(function (err) {
    if (err) {
      console.error(err);
      return process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
});