var views = require('./views');

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
    },
    ///// Initial handlers
    {

        method: 'POST',
        path: '/',
        handler: views.receive.receiveMessage
    },
    {
        method: 'GET',
        path: '/',
        handler: views.retrieveData.fetch
    }
    ];

    return routes;

};
