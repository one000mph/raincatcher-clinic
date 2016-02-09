var config = require('getconfig');
var accountSid = config.twilioAccountSID;
var authToken = config.twilioAuthToken;
var client = require('twilio')(accountSid, authToken);
var q = require('q');
var _ = require('lodash');
var S = require('string');
var fs = require('fs');


var Sequelize = require('sequelize');
var sequelize = new Sequelize('rain_db', null, null, {
	dialect: 'sqlite',
	logging: false,
	storage: './rain_db'
});

var Message = sequelize.define('Message', {
    distance: Sequelize.INTEGER,
    timestamp: Sequelize.DATE
}, {
    tableName: 'Messages'
});

var century = "20"; // assume 21st century

var addMessage = function addMessage (message) {
	return sequelize.authenticate()
	.then(function (err) {
		console.log("Connected to db successfully");
	}, function (err) {
		console.log("Connection unsuccessful\n" + err);
	}).then(function () {
		return Message.sync().then(function () {
			var messageData = parseBody(message);
			console.log('messagedata', messageData);
			return Message.bulkCreate(messageData);
		});
	});
};

var parseBody = function parseBody(messageBody) {
	// verify that the message is valid
	var isMessage = S(messageBody).contains("D");
	if (!isMessage) {
		console.log('message is not valid!');
		return;
	}
	// assume the rest is ok
	else {
		var distancesRaw = S(messageBody).between("", "T").s.split('/');
		distancesRaw.splice(-1, 1); // remove last null element
		var distances = distancesRaw.map(function (el) {
			console.log("Got " + el);
			if (el.length != 0 && el.substr(0,1) == 'D') {
				el = el.substring(1);
				return el * 10;
			}
		});
		// multiplied by 10 to normalize
		var timestamp = S(messageBody).between("T").s;
		var splitDate = timestamp.split("/");
		var year = century + splitDate[0];
		var month = splitDate[1] - 1; // -1 offset because months index from zero
		var day = splitDate[2];
		var hour = splitDate[3];
		console.log("Distances: ", distances);
		console.log("Time: ", "Got " + year + " " + month + " " +  day + " " + hour);
		var date = new Date(year, month, day, hour);
		var messages = [];
		var dataCount = distances.length;
		distances.forEach(function (dist, index) {

			var dataTime = new Date(year, month, day, hour - dataCount + index);
			messages.push({
				distance: dist, 
				timestamp: dataTime
			})
		});
		return messages;
	}
};

var getData = function getData () {
	sequelize.authenticate()
	.then(function (err) {
	    console.log('Connection has been established successfully.');
	}, function (err) {
	    console.log('Unable to connect to the database', err);
	})
	.then(function () {
		// sync with db
	    Message.sync().then(function () {
	    	var messages = [];
	    	// get twilio messages
	        client.messages.get()
	        .then(function (twilioResponse) {
	        	// POSSIBLE BUG: might only pull most recent 50 messages
	        	// from the Twilio API, I'm not sure about this because
	        	// there's so much garbage data in the logs
	            twilioResponse.messages.forEach(function (msg, index) {
	            	var cutoffDate = new Date('2015-10-30');
	                if (msg.status === 'received' && msg.dateCreated > cutoffDate) {
	                	// parse a subset of messages and add to array
	                	var messageData = parseBody(msg.body);
	                	if (messageData.distance && messageData.distance.length > 0) {
	                		if (messageData.timestamp) {
		                		messages.push(messageData);
			                }
	                	}
		            }
	            });
	        }).then(function () {
	        	// add message to db if it didn't previously exist
            	messages.forEach(function (msg) {
	                Message.find({where: msg}).then(function (transmission) {
	                	// console.log('Query Message\n', msg);
	                    if (!transmission) {
	                        Message.create(msg);
	                    }
	                });
	            });  
            }).then(function () {
            	// console.log("hello");
            });
        });
    });
};

module.exports = {
	sequelize: sequelize,
	Message: Message,
	parseBody: parseBody,
	getData: getData,
	addMessage: addMessage
};