var helpers = require('../helpers');


var receiveMessage = function receiveMessage(request, reply) {
	console.log(request.payload);
    var body = request.payload.message; // array of msg strings
    console.log("got body", body);

    //add message to db asynchronously
	return helpers.addMessage(body);
}

module.exports = {
	receiveMessage: receiveMessage
};