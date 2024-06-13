'use strict';

/**
 * url-shortner service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::url-shortner.url-shortner');
