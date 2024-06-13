'use strict';

/**
 * url-shortner router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::url-shortner.url-shortner');
