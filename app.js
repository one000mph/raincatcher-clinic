// Twilio Credentials 
var accountSid = 'AC8e8a461a65b27a908692a92dc8133533'; 
var authToken = '5030a2f3988f7815ef679011170d0b13'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
 
client.messages.get(function(err, response) { 
	console.log(message.body); 
});