#!/usr/bin/node

// required modules 
// var sqlite3 = require('sqlite3').verbose();
var jade = require('jade');
var S = require('string');
var config = require('getconfig');
var _ = require('lodash');
// vars for twilio access
var accountSid = config.twilioAccountSID;
var authToken = config.twilioAuthToken;
var client = require('twilio')(accountSid, authToken);
// required local files
var helpers = require('./server/helpers');
var cgi = require('./cgi'); // Source: https://github.com/puffnfresh/node-cgi/blob/master/cgi.js


var htmlToServe = '<!DOCTYPE html><head><link rel="stylesheet" href="/css/main.css"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-eqiv="refresh" content="3;URL="http://www.cs.hmc.edu/~hseaman/raincatcher-clinic""><title>RainCatcher Data Monitor</title></head><body><nav class="top-nav"><div class="content"><ul><li><a href="/Home">Home</a></li></ul></div></nav> \
</li><li>GPS: 211915.000,3406.3741,N,11742.7166,W,1,04,1.41,392.6,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 211751.000,3406.3796,N,11742.7091,W,2,05,1.56,390.5,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 211444.000,3406.3747,N,11742.7168,W,2,06,1.40,390.8,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 210436.000,3406.3753,N,11742.7180,W,1,06,1.49,391.8,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 205137.000,3406.3719,N,11742.7063,W,1,07,1.32,375.9,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 204229.000,3406.3676,N,11742.7127,W,2,07,1.36,393.5,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 201203.000,3406.3867,N,11742.7055,W,2,05,1.40,405.2,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 200951.000,3406.3835,N,11742.7076,W,1,06,1.34,405.9,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 195533.104,,,,,0,00,,,M,,M,,*75 \
</li><li>GPS: 193746.000,3406.3791,N,11742.7149,W,1,04,2.03,407.5,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 181607.000,3406.3725,N,11742.7089,W,1,05,1.68,372.0,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 180633.000,3406.3848,N,11742.6598,W,1,06,1.47,470.2,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 180321.092,,,,,0,00,,,M,,M,,*7A \
</li><li>GPS: 000005.800,,,,,0,00,,,M,,M,,*75 <li>TimeStamp: 15/10/20,10:54:26-28 \
</li><li>GPS: 000005.800,,,,,0,00,,,M,,M,,*75 <li>TimeStamp: 15/10/19,16:24:45-28 \
</li><li>GPS: 000005.800,,,,,0,00,,,M,,M,,*75 <li>TimeStamp: 15/10/19,16:14:50-28 \
</li><li>GPS: 220140.893,,,,,0,06,,,M,,M,,*79 <li>TimeStamp: 15/10/17,15:01:35-28 \
</li><li>GPS: 215950.937,,,,,0,00,,,M,,M,,*7F <li>TimeStamp: 15/10/17,14:59:45-28 \
</li><li>GPS: 215822.937,,,,,0,00,,,M,,M,,*7B <li>TimeStamp: 15/10/17,14:58:17-28 \
</li><li>GPS: 232440.180,,,,,0,00,,,M,,M,,*72 <li>TimeStamp: 15/10/16,16:24:35-28 \
</li><li>GPS: 231646.671,,,,,0,03,,,M,,M,,*7F <li>TimeStamp: 15/10/16,16:16:39-28 \
$GPRMC,231646.671,V,,,,N*46 \
</li><li>GPS: 231445.670,,,,,0,01,,,M,,M,,*7D16,16:14:39-28 \
</li><li>GPS: 231424.671,,,,,0,00,,,M,,M,,*7A> <li>TimeStamp: 15/10/16,16:14:18-28 \
</li><li>GPS: 230239.585,,,,,0,00,,,M,,M,,*79> <li>TimeStamp: 15/10/16,16:02:33-28 \
</li><li>GPS: 183302.844,,,,,0,03,,,M,,M,,*78> <li>TimeStamp: 15/10/15,11:32:55-28 \
</li><li>GPS: 183144.000,3406.3898,N,11742.7155,W,1,04,1.85,264.7,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 181709.000,3406.3572,N,11742.6800,W,2,04,1.84,421.0,M,-3</li></ul></li><li><ul> <li>T</li><li>GPS: 181127.573,,,,,0,02,,,M,,M,,*77 \
</li><li>GPS: 024316.200,,,,,0,00,,,M,,M,,*78> <li>TimeStamp: 15/10/14,19:43:09-28 \
</li><li>GPS: 233349.086,,,,,0,00,,,M,,M,,*7AeStamp: 15/10/20,16:32:42-28:10:19-28 \
</li><li>GPS: </li></ul></li></ul></div></body>tamp: 15/10/20,20:21:51-2801:11-28';

// initialize the database
// var db = new sqlite3.Database('rain_db');

var Sequelize = require('sequelize');
var sequelize = new Sequelize('rain_db', null, null, {
	dialect: 'sqlite',
	logging: false,
	storage: './rain_db'
});

// parse a single message and return a JSON object containing the message data
var parseBody = function parseBody(messageBody) {
	// verify that the message is valid
	var isTransmission = S(messageBody).contains("+CCLK");
	if (!isTransmission) {
		// console.log("Beginning of received message " + messageBody + " is not valid, CONTINUING\n\n");
	}
	// assume the rest is ok
	else {
		var timestamp = S(messageBody).between("+CCLK: ", "\n").strip('"').s;
		var signalStrength = S(messageBody).between("+CSQ: ", "\n").s;
		var network = S(messageBody).between("+COPS: ", "\n").s;
		var gpsCoords = "";
		if (S(messageBody).contains("GPGGA")) {
			gpsCoords = S(messageBody).between("GPGGA,").s;
		}
	}
	// if (!timestamp) console.log('NO TIMESTAMP ON', messageBody);
	return {
		timestamp: timestamp,
		signalStrength: signalStrength,
		network: network,
		gpsCoords: gpsCoords
	};
};


var server = cgi.createServer(function (request, response) {
	response.writeHead(200, {'Content-Type': 'text/http'});
	// response.write('This is CGI!');
	// response.write(htmlToServe);
	// response.end();
	sequelize.authenticate()
	.then(function (err) {
		// console.log('Connected has been established successfully.');
	}, function (err) {
		// console.log('Unable to connect to the database', err);
	})
	.then(function () {
		var Transmission = sequelize.define('Transmission', {
			timestamp: Sequelize.STRING,
			signalStrength: Sequelize.STRING,
			network: Sequelize.STRING,
			gpsCoords: Sequelize.STRING
		}, {
			tableName: 'transmission_table'
		});

		Transmission.sync().then(function () {
			// console.log('getting messages');
			client.messages.get()
			.then(function (twilioResponse) {
				messages = []
				twilioResponse.messages.forEach(function (msg) {
					if (msg.status === 'received') {
						var messageData = parseBody(msg.body);
						if (messageData.timestamp) {
							messages.push({
								timestamp: messageData.timestamp,
								signalStrength: messageData.signalStrength,
								network: messageData.network,
								gpsCoords: messageData.gpsCoords
							});
						}
					}
				});
				// do something with the extracted JSONs
				messages.forEach(function (msg) {
					Transmission.find({where: msg}).then(function (transmission) {
						if (!transmission) {
							Transmission.create(msg);
						}
					});
				});
				Transmission.findAll().then(function (transmissions) {
					// console.log(response);
					var transmissionData = _.pluck(transmissions, 'dataValues');
					var htmlToServe = jade.renderFile('./templates/index.jade', transmissionData);
					// response.write('This is CGI!');
					response.write(htmlToServe);
					response.end();
				});
			});
		});
	});
});

server.listen();
