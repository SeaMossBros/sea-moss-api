module.exports = [
  'strapi::errors',
  'strapi::security', 
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::query',
  'strapi::public',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'https://seathemoss.com', 'https://www.seathemoss.com'],
      headers: '*', // Which headers are allowed
    },
  },
]
