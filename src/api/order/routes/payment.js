'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/payments/confirm',
      handler: 'payment.confirm',
      config: {
        auth: false,
      },
    },
  ]
}