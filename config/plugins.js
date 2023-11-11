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
      },
    },
  },
  'schemas-to-ts': {
    enabled: true,
  }
}