module.exports = ({ env }) => ({
  // host: env('HOST', '0.0.0.0'),
  // port: env.int('PORT', 1337),
  url: env('SERVER_URL', 'https://balanced-creativity-f2f8470846.strapiapp.com'), 
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
