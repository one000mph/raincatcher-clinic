var helpers = require('../helpers');

var config = require('getconfig');
var _ = require('lodash');

var fetch = function fetch(request, reply) {
	console.log('requesting page');
	helpers.Message.findAll({order: 'createdAt DESC'}).then(function (transmissions) {
		var truncatedData = transmissions.splice(0, 10);
		var orderedData = truncatedData.reverse();
		var transmissionData = _.pluck(orderedData, 'dataValues');
		var distances = _.pluck(transmissionData, 'distance');
		var timestamps = _.pluck(transmissionData, 'createdAt');
		var distanceData = [];
		distances.forEach(function (dist, index) {
		  var waterHeight = 250 - dist;
		  var utcDate = timestamps[index].getTime();
		  // console.log("UTC,", utcDate);
	      var entry = {'x': utcDate, 'y': waterHeight}
	      distanceData.push(entry);
	    });

	    console.log("distanceData", distanceData);
	    console.log("load", transmissionData);

		
		var context = {'load': transmissionData, 'distances': distanceData };
		reply.view('index', context)
	});
}

module.exports = {
	fetch: fetch
};



