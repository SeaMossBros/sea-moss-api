'use strict'

module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/url-shortner/s/:shortCode',
            handler: 'shorten.redirect',
            config: {
                auth: false,
            },
        },
    ]
}