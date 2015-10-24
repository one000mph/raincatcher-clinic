var config = require('getconfig');
var accountSid = config.twilioAccountSID;
var authToken = config.twilioAuthToken;
var client = require('twilio')(accountSid, authToken);

var _ = require('lodash');
var S = require('string');

var Sequelize = require('sequelize');
var sequelize = new Sequelize('rain_db', null, null, {
    dialect: 'sqlite',
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

var Transmission = sequelize.define('Transmission', {
    timestamp: Sequelize.STRING,
    signalStrength: Sequelize.STRING,
    network: Sequelize.STRING,
    gpsCoords: Sequelize.STRING
}, {
    tableName: 'transmission_table'
});

var getData = function getData () {
	sequelize.authenticate()
	.then(function (err) {
	    console.log('Connection has been established successfully.');
	}, function (err) {
	    console.log('Unable to connect to the database', err);
	})
	.then(function () {
	    Transmission.sync().then(function () {
	        console.log('getting messages');
	        client.messages.get()
	        .then(function (twilioResponse) {
	            var messages = []
	            console.log("msg Count", twilioResponse.messages.length);
	            twilioResponse.messages.forEach(function (msg, index) {
	                console.log("MESSAGE", msg, index);
	                if (msg.status === 'received') {
	                	var messageData = parseBody(msg.body);
	                	if (messageData.timestamp) {
	                		messages.push(messageData);
		                }
		            }
	            });
	            // add Transmission instance to db if it didn't previously exist
	            messages.forEach(function (msg) {
	                Transmission.find({where: msg}).then(function (transmission) {
	                    if (!transmission) {
	                        Transmission.create(msg);
	                    }
	                });
	            });
	        });
	    });
	});
};

module.exports = {
	sequelize: sequelize,
	Transmission: Transmission,
	sequelize: sequelize,
	getData: getData
};