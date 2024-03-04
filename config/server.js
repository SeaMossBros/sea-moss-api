module.exports = ({ env }) => ({
  host: env('HOST', 'seathemoss'),
  port: env.int('PORT', 1337),
  url: env('SERVER_URL', 'https://seathemoss:1337'), 
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
