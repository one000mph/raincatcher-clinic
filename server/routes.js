var views = require('./views');

var accountSid = 'AC8e8a461a65b27a908692a92dc8133533';
var authToken = "5030a2f3988f7815ef679011170d0b13";
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
            var messages = client.messages.get(function (err, response) {
                var context = {};
                var rowInd = 0;
                views.dbHelper(response, function () {
                    db.serialize( function () {
                        db.each("SELECT timestamp, signal_strength, network, gps_coords FROM transmission", function(err, row) {
                            context[rowInd] = row;
                            rowInd++;
                          });
                    });
                    reply.view('index', context);
                });
            });
        }
    }
    ];

    return routes;

};
