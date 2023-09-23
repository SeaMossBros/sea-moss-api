module.exports = {
  load: {
    before: [
      'strapi::errors',
      'strapi::security',
      'strapi::cors',
      'strapi::poweredBy',
      'strapi::logger',
      'strapi::body',
      'strapi::session',
      'strapi::favicon',
      'strapi::query'
    ],
    after: ['strapi::public'],
  },
  settings: {
    cors: {
      enabled: true,
      origin: ['https://sea-moss-sea-moss-bros.vercel.app', 
        'https://sea-moss-git-main-sea-moss-bros.vercel.app',
      ]
    },
  },
};
