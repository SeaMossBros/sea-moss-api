const fs = require('fs');
const dkimPrivateKey = fs.existsSync('./new-dkim-private.pem') ? fs.readFileSync('./new-dkim-private.pem', 'utf8') : null;
const dkim = dkimPrivateKey ? { privateKey: dkimPrivateKey, keySelector: 'newkey._domainkey.seathemoss.com' } : false;

module.exports = {
  email: {
    provider: 'sendmail',
    providerOptions: { dkim },
    settings: {
      defaultFrom: 'support@seathemoss.com',
      defaultReplyTo: 'support@seathemoss.com',
    },
    config: {
      settings: {
        defaultFrom: 'support@seathemoss.com',
        defaultReplyTo: 'support@seathemoss.com',
      }
    }
  },
  slugify: {
    enabled: true,
    slugifyWithCount: true,
    skipUndefinedReferences: true,
    config: {
      contentTypes: {
        product: {
          field: 'slug',
          references: 'name',
        },
        article: {
          field: 'slug',
          references: 'title'
        }
      },
    },
  },
  'import-export-entries': {
    enabled: true,
  },
  'schemas-to-ts': {
    enabled: true,
  },
  'fuzzy-search': {
    enabled: true,
    config: {
      contentTypes: [
        {
          uid: "api::article.article",
          modelName: "article",
          fuzzysortOptions: {
            characterLimit: 500,
            threshold: -1000,
            limit: 15,
            keys: [
              {
                name: "title",
                weight: 100,
              },
              {
                name: "introduction",
                weight: 100,
              },
              {
                name: 'content',
                weight: 200
              }
            ],
          },
        },
        {
          uid: "api::product.product",
          modelName: "product",
          fuzzysortOptions: {
            characterLimit: 500,
            threshold: -1000,
            limit: 15,
            keys: [
              {
                name: "name",
                weight: 300,
              },
              {
                name: "description",
                weight: 300,
              }
            ],
          },
        },
      ],
    },
  },
  "strapi-google-auth": {
    enabled: true,
  },
}