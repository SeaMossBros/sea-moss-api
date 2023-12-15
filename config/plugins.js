module.exports = {
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