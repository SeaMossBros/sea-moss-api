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
  }
}