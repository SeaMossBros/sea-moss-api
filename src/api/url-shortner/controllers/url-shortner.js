'use strict';

/**
 * url-shortner controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::url-shortner.url-shortner');
