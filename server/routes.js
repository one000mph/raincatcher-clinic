var views = require('./views');
// var validateUtils = require('./utils/validateUtils.js');


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
    }, {

        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            console.log("triggering handler");
            reply.view('inbound');
        }
    }];

    return routes;

};
