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
          uid: "api::author.author",
          modelName: "article",
          fuzzysortOptions: {
            characterLimit: 500,
            threshold: -1000,
            limit: 15,
            keys: [
              {
                name: "title",
                weight: 1,
              },
              {
                name: "introduction",
                weight: 1,
              },
              {
                name: 'content',
                weight: 2
              }
            ],
          },
        },
      ],
    },
  }
}