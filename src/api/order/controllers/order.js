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

                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: item.name
                            },
                            unit_amount: item.price * 100,
                        },
                        quantity: qty,
                    }
                })
            );

            console.log('lineItems', lineItems);

            // create a stripe session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: email || 'elijahally18@gmail.com', // TODO remove root email
                mode: 'payment',
                success_url: 'http://localhost:3000/checkout/success',
                cancel_url: 'http://localhost:3000',
                line_items: lineItems
            })

            console.log('session', session);

            const userName = `${firstName || 'jkdshfksa'} ${lastName || 'sadfsdaf'}`;
            // create order in strapi
            await strapi.service('api::order.order').create({
                data: { userName, products, stripeSessionId: session.id },
            })

            // return sesion id
            return { id: session.id }
        } catch (error) {
            ctx.response.status = 500;
            return { error: { message: 'There was a problem creating order', error }}
        }
    }
}));
