const updateProductRatingAfterUpsert = async (productId, review) => {
  const [reviewsCount, product] = await Promise.all([
    strapi.entityService.count('api::product-review.product-review', {
      filters: {
        product: {
          id: productId
        },
      }
    }),
    strapi.entityService.findOne('api::product.product', productId)
  ])

  const currentProductRating = product.rating ?? 0
  const previousSumRatings = currentProductRating * (reviewsCount - 1)

  const sumRatings = previousSumRatings + review.rating

  const newRating = sumRatings / reviewsCount

  await strapi.entityService.update('api::product.product', productId, {
    data: {
      rating: newRating
    }
  })
}

const updateProductRatingAfterDelete = async (productId, state) => {
  const [reviewsCount, product] = await Promise.all([
    strapi.entityService.count('api::product-review.product-review', {
      filters: {
        product: {
          id: productId
        },
      }
    }),
    strapi.entityService.findOne('api::product.product', productId)
  ])

  const currentProductRating = product.rating ?? 0
  const previousSumRatings = currentProductRating * (reviewsCount + state.count)

  const sumRatings = previousSumRatings - state.rating

  const newRating = reviewsCount ? sumRatings / reviewsCount : 0

  await strapi.entityService.update('api::product.product', productId, {
    data: {
      rating: newRating
    }
  })
}

module.exports = {
  afterCreate(event) {
    const { result, params: {
      data
    } } = event

    updateProductRatingAfterUpsert(data.product, result)
  },
  async beforeDelete(event) {
    const { params: {
      where: {
        id
      }
    } } = event

    const review = await strapi.entityService.findOne('api::product-review.product-review', id, {
      populate: ['product']
    })

    event.state.productId = review.product?.id
  },
  afterDelete(event) {
    const { result, state: {
      productId
    } } = event

    if (!productId) return

    updateProductRatingAfterDelete(productId, {
      rating: result.rating,
      count: 1
    })
  },
  async beforeDeleteMany(event) {
    const { params: {
      where
    } } = event

    const reviews = await strapi.entityService.findMany('api::product-review.product-review', {
      filters: where,
      populate: ['product']
    })

    event.state.reviews = reviews ?? []
  },
  afterDeleteMany(event) {
    const { state: {
      reviews
    }, result: {
      count
    } } = event

    const productId = reviews?.[0]?.product?.id
    if (!productId) return;

    const state = {
      rating: reviews?.reduce((sum, review) => sum + review.rating, 0),
      count
    }

    updateProductRatingAfterDelete(productId, state)
  }
}