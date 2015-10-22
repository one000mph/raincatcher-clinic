var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('rain_db');

var S = require('string');

var dbHelper = function dbHelper (allMessages) {
	db.serialize(function () {
		var stmt = db.prepare("INSERT INTO transmission (timestamp, signal_strength, network, gps_coords) VALUES (?, ?, ?, ?)");
		// for each message parse it and add data to the db
		allMessages.messages.forEach(function (msg) {
			if (msg.status === "received") {
				return parseBody (msg.body, function (messageData) {
	            	stmt.run(
	            		messageData.timestamp, 
	            		messageData.signalStrength,
	            		messageData.network,
	            		messageData.gpsCoords
	            	);
	            });
            }
        });
        stmt.finalize();
	});
};

var parseBody = function parseBody(messageBody, callback) {
	// verify that the message is valid
	var beginning = messageBody.substr(0,7);
	if (beginning !== "+CCLK: ") {
		console.log("Beginning of received message " + messageBody + " is not valid, CONTINUING\n\n");
	}
	// assume the rest is ok
	else {
		console.log("WHOLE MESSAGE:", messageBody);
		var timestamp = S(messageBody).between("+CCLK: ", "\n").strip('"').s;
		console.log("TIMESTAMP:", timestamp);
		var signalStrength = S(messageBody).between("+CSQ: ", "\n").s;
		console.log("SIGNAL:",signalStrength);
		var network = S(messageBody).between("+COPS: ", "\n").s;
		var gpsCoords = "";
		console.log("NETWORK:",network);
		if (S(messageBody).contains("GPGGA")) {
			gpsCoords = S(messageBody).between("GPGGA,").s;
		}
		console.log("GPS:",gpsCoords);
	}
	messageData = {
		timestamp: timestamp,
		signalStrength: signalStrength,
		network: network,
		gpsCoords: gpsCoords
	};
	callback(messageData);
};

module.exports = {
	dbHelper: dbHelper,
	parseBody: parseBody
};