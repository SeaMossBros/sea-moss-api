'use strict';
// @ts-ignore
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    async create(ctx) {
        try {
            console.log('ctx.request.body', ctx.request.body);
            const {
                products,
                quantities,
                firstName, 
                lastName,
                email,
                totalCost,
            } = ctx.request.body;

            // retrieve product info first
            const lineItems = await Promise.all(
                products.map(async (product) => {
                    // product: {
                    //     id: product.id,
                    //     attributes: {
                    //         price: product.attributes.price,
                    //         about: product.attributes.about,
                    //         name: product.attributes.name,
                    //         createdAt: product.attributes.createdAt,
                    //         stock: product.attributes.stock,
                    //         images: getImagesFromAPIResponse(product.attributes.images.data),
                    //     },
                    // }

                    const item = await strapi
                        .service("api::product.product")
                        .findOne(product.id)
                    
                    console.log('found item in create order', item);
                    
                    const qty = quantities.find(quant => quant.productId === product.id)?.quantity || 1;

                    console.log('qty', qty);
                    
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: item.name
                            },
                            unit_amount: item.price * 100, // change to available stock 
                        },
                        quantity: qty,
                    }
                })
            );

            console.log('lineItems', lineItems);
// TODO MAKE Sripe input not rounded
            // create a stripe session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: email || 'root@root.com', // TODO remove root email
                mode: 'payment',
                success_url: 'http://localhost:3000/checkout/success',
                cancel_url: 'http://localhost:3000/cart',
                line_items: lineItems,
                invoice_creation: {
                    enabled: true,
                },
                custom_fields: [
                    {
                        key: 'feedback',
                        label: {
                            custom: "Leave us feedback on your checkout experience :)",
                            type: 'custom'
                        },
                        type: 'text',
                        text: {
                            maximum_length: 42,
                        },
                        optional: true
                    }
                ]
            })

            console.log('session', session);

            // create order in strapi
            const userName = `${firstName} ${lastName}`;
            await strapi.service('api::order.order').create({
                data: {
                    totalCost,
                    userName,
                    products,
                    stripeSessionId:
                    session.id 
                },
            })

            // return sesion id
            ctx.response.status = 200;
            return { session };
        } catch (error) {
            console.log(JSON.stringify(error));
            ctx.response.status = 500;
            return { error: { message: 'There was a problem creating order', error }}
        }
    }
}));
