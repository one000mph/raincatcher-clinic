var views = require('./helpers');

var config = require('getconfig');
var accountSid = config.twilioAccountSID;
var authToken = config.twilioAuthToken;
var client = require('twilio')(accountSid, authToken);
var dbHelper = require('../dbHelper');

var _ = require('lodash');

var sequelize = dbHelper.sequelize;

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
            dbHelper.Transmission.findAll().then(function (transmissions) {
                var transmissionData = _.pluck(transmissions, 'dataValues');
                reply.view('index', transmissionData);
            });
        }
    }
    ];

    return routes;

};
