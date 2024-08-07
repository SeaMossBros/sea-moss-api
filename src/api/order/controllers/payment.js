'use strict';

const Stripe = require("stripe").default;
const Shippo = require("shippo")(process.env.SHIPPO_TEST_TOKEN);
const axios = require('axios');
const crypto = require('crypto');

module.exports = {
  confirm: async (ctx, next) => {
    try {
      const { session_id } = ctx.query

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-08-16'
      })

      const session = await stripe.checkout.sessions.retrieve(session_id);
      // console.log('session', session);
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
            const isWeekend = (date) => {
              const day = date.getUTCDay();
              return day === 6 || day === 0; // Saturday is 6, Sunday is 0
            }

            const isHoliday = (date) => {
              // Define holidays as an array of strings in the format 'MM-DD'
              const holidays = ['01-01', '01-15', '02-19', '05-27', '06-19', '07-04', '09-02', '10-14', '11-11', '11-26', '11-27', '11-28', '11-29', '12-24', '12-25', '12-31']; // Example holidays

              const dateString = date.toISOString().split('T')[0];
              const monthDay = dateString.substring(5); // get MM-DD part
              return holidays.includes(monthDay);
            }

            const getFutureDate = (daysInFuture) => {
              let futureDate = new Date();
              futureDate.setUTCDate(futureDate.getUTCDate() + daysInFuture);

              // Check if the future date falls on a weekend
              if (isWeekend(futureDate)) {
                // Move to Monday
                futureDate.setUTCDate(futureDate.getUTCDate() + (8 - futureDate.getUTCDay()));
              }

              // Check if the future date is a holiday
              while (isHoliday(futureDate)) {
                futureDate.setUTCDate(futureDate.getUTCDate() + 2);

                // If the new date is a weekend, move to the next Monday
                if (isWeekend(futureDate)) {
                  futureDate.setUTCDate(futureDate.getUTCDate() + (8 - futureDate.getUTCDay()));
                }
              }

              // Return the date as an ISO string in this format 2014-01-18T00:35:03.463Z (required by Shippo)
              return futureDate.toISOString();
            }

            // Example usage
            const shipmentDate = getFutureDate(2); // will ship 2 days in the future

            // create parcels for shippo
            const parcels = [];
            for (let i = 0; i < order.cart.cart_items.length; i++) {
              const cart_item = order.cart.cart_items[i];
              const packageDimensionsArr = cart_item.options.product_variant.package_dimensions.split('x');
              parcels.push({
                "width": packageDimensionsArr[0].slice(1),
                "length": packageDimensionsArr[1].slice(1),
                "height": (Number(packageDimensionsArr[2].slice(1)) * cart_item.options.quantity).toString(),
                "distance_unit": cart_item.options.product_variant.package_dimensions_unit,
                "weight": `${(cart_item.options.product_variant.weight + 2) * cart_item.options.quantity}`, // adds 2 to account for packaging
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
                "email": "support@seathemoss.com", // required
                "is_residential": false,
                "phone": "+1 240 501 2148", // required
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
                "is_residential": true,
                "email": session.customer_email,
              },
              "parcels": getParcels(), // ! needed, but not sure why... Do NOT change.
              "extra": {
                "bypass_address_validation": true,
              },
              "shipment_date": shipmentDate,
              "async": false
            })

            const shippingAmountSelected = Number((session.total_details.amount_shipping / 100).toFixed(2));

            let serviceLevelName = '';
            switch (shippingAmountSelected) {
              case 3.99:
                serviceLevelName = 'Ground Advantage';
                break;

              case 16.99:
                serviceLevelName = 'Priority Mail';
                break;
            
              default:
                break;
            }

            const costIsLessThanAndSimilar = (rateCost) => {
              if (rateCost > shippingAmountSelected) return false;
              if ((shippingAmountSelected - rateCost) > 1) return false;
              return true;
            }
            
            let shippingRate = shipmentRes.rates.filter(rate => 
              rate.provider === 'USPS' 
              && (costIsLessThanAndSimilar(Number(rate.amount)) || serviceLevelName === rate.servicelevel.name)
            )[0] || null;

            if (!shippingRate) {
              let cheapestRate = null;
              for (let i = 0; i < shipmentRes.rates.length; i++) {
                if (!cheapestRate || Number(shipmentRes.rates[i].amount) < Number(cheapestRate.amount)) {
                  cheapestRate = shipmentRes.rates[i];
                }
              }
              shippingRate = cheapestRate;
            }

            // Purchase the desired rate.
            const transactionRes = !!shippingRate ? await Shippo.transaction.create({
              "rate": shippingRate.object_id,
              "label_file_type": "PDF_2.3x7.5",
              "async": false
            }) : {
              tracking_url_provider: '',
              label_url: ''
            };
            
            const customerExperience = session.custom_fields.find((field) => field.key === 'customers_shopping_experience_kjha09823sdiwyi2u0422').text.value || '';

            /**
             * @type {any}
            */
            const customer = await stripe.customers.retrieve(session.customer.toString())
            
            // create short code
            let shortCode;
            let existingEntry;

            do  {
              shortCode = crypto.createHash('md5').update(transactionRes.label_url).digest('hex').slice(0, 6);
  
              // Check if the shortCode already exists
              existingEntry = await strapi.query('api::url-shortner.url-shortner').findOne({
                where: { short_code: shortCode },
              });
            } while (existingEntry)

            // Create new ShortUrl entry
            await strapi.entityService.create('api::url-shortner.url-shortner', {
              data: { 
                url: transactionRes.label_url, 
                short_code: shortCode 
              }
            });

            const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
              data: {
                total: (session.amount_total / 100).toFixed(2),
                payment_status: "success",
                tracking_url_provider: transactionRes.tracking_url_provider,
                label_url: `${process.env.SERVER_URL}/api/url-shortner/s/${shortCode}`,
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
            
            try {
              const phoneNumbers = ['2405012148', '2402735088'];
              for (let i = 0; i < phoneNumbers.length; i++){
                await axios.post('https://textbelt.com/text', {
                  phone: phoneNumbers[i],
                  message: `A new order for ${'$' + updatedOrder.total} was placed on SeaTheMoss by\n`
                    + `${existingUser.username || existingUser.email}\n`
                    +`*** Order #${updatedOrder.id} ***\n\n`
                    + 'View the order here: seathemoss.com/profile/customer-orders\n\n'
                    + `Or print the label here:\n${updatedOrder.label_url}`,
                  key: process.env.TEXT_BELT_API,
                });
              }
            } catch (err) {
              console.error(err);
            }

            ctx.body = JSON.stringify({ ...responseData, user: existingUser });
          } catch (err) {
            console.error(err);
            ctx.response.status = 500;
            ctx.body = { error: { message: 'There was a problem processing the shipment', details: err.message } };
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
      console.error(err);
      ctx.response.status = 500;
      ctx.body = { error: { message: 'There was a problem confirming the order', details: err.message } };
    }
  }
};
