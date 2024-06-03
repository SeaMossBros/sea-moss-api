'use strict';

const Stripe = require("stripe").default;
const Shippo = require("shippo")(process.env.SHIPPO_TEST_TOKEN);

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
        populate: { // ['cart']
          cart: {
            populate: {
              cart_items: {
                populate: {
                  product: true,
                  purchase_option: true,
                  options: {
                    populate: {
                      product_variant: true,
                      properties: {
                        populate: {
                          product_property: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } 
      })
      /**
      * @type {import("../content-types/order/order").Order_Plain}
      */
      const order = matchedOrders[0]
      if (!order) throw new Error(`Order with payment session ID = '${ session.id }' not found`)

      switch (session.status) {
        case 'complete': { 
          try {
            // create parcels for shippo
            const parcels = [];
            for (let i = 0; i < order.cart.cart_items.length; i++) {
              const cart_item = order.cart.cart_items[i];
              const packageDimensionsArr = cart_item.options.product_variant.package_dimensions.split('x');
              parcels.push({
                "width": packageDimensionsArr[0].slice(1),
                "length": packageDimensionsArr[1].slice(1),
                "height": packageDimensionsArr[2].slice(1),
                "distance_unit": cart_item.options.product_variant.package_dimensions_unit,
                "weight": `${cart_item.options.product_variant.weight}`,
                "mass_unit": cart_item.options.product_variant.weight_unit,
              });
            }

            const getParcels = () => parcels; // ! needed, but not sure why... Do NOT remove.

            const shipmentRes = await Shippo.shipment.create({
              "address_from": {
                "name": "E-Commerce",
                "company": "SeaTheMoss",
                "street1": "68 White St.",
                "street2": "7-224",
                "city": "Red Bank",
                "state": "NJ",
                "zip": "07701",
                "country": "US", // iso2 country code
                "email": "support@seathemoss.com",
                // "phone": "+1 555 341 9393",
              },
              "address_to": {
                "name": session.shipping_details.name,
                "street1": session.shipping_details.address.line1,
                "street2": session.shipping_details.address.line2,
                "city": session.shipping_details.address.city,
                "state": session.shipping_details.address.state,
                "zip": session.shipping_details.address.postal_code,
                "country": "US", // iso2 country code, session.shipping_details.address.country
                "phone": session.shipping_details.phone || "",
                "company": "",
                // "email": "",
              },
              "parcels": getParcels(), // ! needed, but not sure why... Do NOT change.
              "async": true
            })

            // console.log('\n')
            // console.log('shipmentRes', shipmentRes)
            
            let cheapestRate = null;
            // console.log('\nrates count: ', shipmentRes.rates.length + '\n');
            for (let i = 0; i < shipmentRes.rates.length; i++) {
              if (!cheapestRate || Number(shipmentRes.rates[i].amount) < Number(cheapestRate.amount)) {
                cheapestRate = shipmentRes.rates[i];
              }
            }

            // Purchase the desired rate.
            const transactionRes = !!cheapestRate ? await Shippo.transaction.create({
              "rate": cheapestRate.object_id,
              "label_file_type": "PDF",
              "async": true
            }) : {
              tracking_url_provider: '',
              label_url: ''
            };
            
            // console.log('\n')
            // console.log('transactionRes', transactionRes)
            
            const customerExperience = session.custom_fields.find((field) => field.key === 'customers_shopping_experience_kjha09823sdiwyi2u0422').text.value || '';

            /**
             * @type {any}
            */
            const customer = await stripe.customers.retrieve(session.customer.toString())
            // console.log('payment res data', {
            //   payment_status: "success",
            //   tracking_url_provider: transactionRes.tracking_url_provider,
            //   label_url: transactionRes.label_url,
            //   shipping_address: JSON.stringify(shipmentRes.address_to),
            //   customer_experience: customerExperience,
            //   user_email: customer.email,
            //   publishedAt: new Date()
            // });
            const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
              data: {
                payment_status: "success",
                tracking_url_provider: transactionRes.tracking_url_provider,
                label_url: transactionRes.label_url,
                shipping_address: JSON.stringify(shipmentRes.address_to),
                customer_experience: customerExperience,
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
                const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$.+-';
                let password = '';
                for (let i = 0; i < length; i++) {
                  const randomIndex = Math.floor(Math.random() * charset.length);
                  password += charset[randomIndex];
                }
                return password;
              }
              
              const password = generatePassword(16); 
              
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
            
            responseData.order = updatedOrder
            /**
             * @type {import("../../cart/content-types/cart/cart").Cart_Plain}
            */
           strapi.entityService.update('api::cart.cart', order.cart.id, {
             data: {
               is_checked_out: true,
              }
            })
            
            ctx.body = JSON.stringify({ ...responseData, user: existingUser });
          } catch (err) {
            console.log(err);
          }
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
