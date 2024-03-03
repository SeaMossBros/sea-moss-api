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
          const customer = await stripe.customers.retrieve(session.customer.toString())
          const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
            data: {
              payment_status: 'success',
              user_email: customer.email,
              publishedAt: new Date()
            }
          })

          // Check if the email is already in use
          let existingUser = await strapi.query('plugin::users-permissions.user').findOne({
            where: { email: customer.email },
          });

          if (!existingUser) {
            function generatePassword(length = 12) {
              const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
              let password = '';
              for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset[randomIndex];
              }
              return password;
            }

            // Example usage:
            const password = generatePassword(16); 

            // const newStrapiCustomer = await strapi.auth.register();
            // Create the user
            existingUser = await strapi.plugins['users-permissions'].services.user.add({
              username: customer.email.split('@')[0],
              email: customer.email ,
              password,
              provider: 'local',
              role: 1
            });
            existingUser = { ...existingUser, password }
          }

          console.log('existingUser', existingUser);

          responseData.order = updatedOrder
          strapi.entityService.update('api::cart.cart', order.cart.id, {
            data: {
              is_checked_out: true,
            }
          })

          ctx.body = JSON.stringify({ ...responseData, user: existingUser });
          return;
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

      ctx.body = JSON.stringify({ ...responseData, user: null});
    } catch (err) {
      ctx.body = err;
    }
  }
};
