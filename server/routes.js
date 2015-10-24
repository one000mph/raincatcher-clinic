var views = require('./helpers');

var accountSid = config.twilioAccountSID;
var authToken = config.twilioAuthToken;
var client = require('twilio')(accountSid, authToken);

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('rain_db');


module.exports = function _routes () {

    var routes = [{
        ////////////////////////////////// STATIC
        method: 'GET',
        path: '/css/{path}',
        config: { auth: false },
        handler: { directory: { path: './public/css', listing: false } }
    }, {
        method: 'GET',
        path: '/images/{path}',
        config: { auth: false },
        handler: { directory: { path: './public/images', listing: false } }
    }, {
        method: 'GET',
        path: '/js/{path}',
        config: { auth: false },
        handler: { directory: { path: './public/js', listing: false } }
    }, {
        method: 'GET',
        path: '/favicon.ico',
        config: { auth: false },
        handler: { file: { path: './public/favicon.ico' } }
    }, 
    ///// Initial handlers
    {

        method: 'POST',
        path: '/',
        handler: function (request, reply) {
            reply.view('inbound');
        }
    },
    {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            sequelize.authenticate()
            .then(function (err) {
                console.log('Connection has been established successfully.');
            }, function (err) {
                console.log('Unable to connect to the database', err);
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
                            reply.view('index', transmissionData);
                            
                        });
                    });
                });
            });
        });
    }
    ];

    return routes;

};
