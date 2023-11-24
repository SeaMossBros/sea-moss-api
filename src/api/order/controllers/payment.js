'use strict';
const Stripe = require("stripe").default;

module.exports = {
  confirm: async (ctx, next) => {
    try {
      const { session_id } = ctx.query

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-08-16'
      })

      const session = await stripe.checkout.sessions.retrieve(session_id)

      const responseData = {
        status: session.status
      }

      /**
           * @type {any}
           */
      const matchedOrders = await strapi.entityService.findMany('api::order.order', {
        filters: {
          payment_session_id: session.id,
          payment_status: 'pending'
        },
        populate: ['cart']
      })
      /**
       * @type {import("../content-types/order/order").Order_Plain}
       */
      const order = matchedOrders[0]
      if (!order) throw new Error(`Order with payment session ID = '${ session.id }' not found`)

      switch (session.status) {
        case 'complete': {
          /**
           * @type {any}
           */
          const customer = await stripe.customers.retrieve(session.customer)
          const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
            data: {
              payment_status: 'success',
              user_email: customer.email,
              publishedAt: new Date()
            }
          })
          responseData.order = updatedOrder
          strapi.entityService.update('api::cart.cart', order.cart.id, {
            data: {
              is_checked_out: true,
            }
          })
          break
        }
        case 'expired': {
          const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
            data: {
              payment_status: 'cancelled',
              user_email: session.customer_email,
              publishedAt: new Date()
            }
          })
          responseData.order = updatedOrder
          strapi.entityService.update('api::cart.cart', order.cart.id, {
            data: {
              is_checked_out: false,
            }
          })
          break
        }
        default:
          break
      }

      ctx.body = JSON.stringify(responseData);
    } catch (err) {
      ctx.body = err;
    }
  }
};
