'use strict';

const { addMinutes } = require("date-fns");

const Stripe = require("stripe").default;

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    /**
     * 
     * @param {any} ctx 
     * @returns 
     */
    async create(ctx) {
        try {
            const { data } = ctx.request.body
            console.log('checkout', {
                data
            })

            const existingOrders = await strapi.entityService.findMany('api::order.order', {
                filters: {
                    cart: {
                        id: parseInt(`${ data.cartId }`)
                    }
                }
            })

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2023-08-16'
            })

            if (existingOrders.length) {
                await Promise.all(existingOrders.map(order => {
                    return [
                        // delete previous order
                        strapi.entityService.delete('api::order.order', order.id),
                        ...(order.payment_session_id ? [
                            stripe.checkout.sessions.expire(order.payment_session_id)
                        ] : [])
                    ]
                }).flat())
            }

            const cart = await strapi.entityService?.findOne('api::cart.cart', data.cartId, {
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
            })

            /**
             * @type {'payment' | 'subscription'}
             */
            let mode = 'payment'

            /**
             * @type {Stripe.Checkout.SessionCreateParams.LineItem[]}
             */
            const line_items = cart.cart_items.map(item => {
                const unit_amount = (() => {
                    const unit_price = item.options.product_variant.unit_price
                    const units_per_stock = item.options.product_variant.units_per_stock

                    const originalPrice = unit_price * units_per_stock

                    if (!item.purchase_option.has_discount) return originalPrice

                    switch (item.purchase_option.discount_unit) {
                        case 'fiat':
                            return originalPrice - item.purchase_option.discount_value
                        case 'percentage':
                            const percentageLeft = 100 - item.purchase_option.discount_value
                            return (originalPrice / 100) * percentageLeft
                        default:
                            return originalPrice
                    }
                })()

                if (item.purchase_option.type === 'recurring' && mode !== 'subscription') {
                    mode = 'subscription'
                }

                return {
                    price_data: {
                        currency: 'USD',
                        product_data: {
                            name: `${ item.product.name }`,
                            description: `${ item.options.product_variant.name } x ${ item.options.quantity }`
                        },
                        recurring: item.purchase_option.type === 'recurring' ? {
                            interval: item.purchase_option.recurring_interval ?? 'month',
                            interval_count: item.purchase_option.recurring_interval_count
                        } : undefined,
                        unit_amount_decimal: (unit_amount * 100).toFixed(2)
                    },
                    quantity: item.options.quantity
                }
            })

            const session = await stripe.checkout.sessions.create({
                mode,
                client_reference_id: data.cartId,
                line_items,
                success_url: `${ process.env.FRONTEND_ORIGIN }/payments/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${ process.env.FRONTEND_ORIGIN }/payments/cancel?session_id={CHECKOUT_SESSION_ID}`,
                expires_at: Math.round(addMinutes(new Date(), 30).getTime() / 1000), // to Unix timestamp, 30 minutes after check-out
                customer_creation: mode === 'payment' ? 'always' : undefined
            })

            const total = session.amount_total / 100

            const order = await strapi.entityService.create('api::order.order', {
                data: {
                    payment_session_id: session.id,
                    total,
                    cart: data.cartId,
                    payment_status: 'pending'
                }
            })
            return { data: order, paymentUrl: session.url }
        } catch (error) {
            console.error(error)
            ctx.response.status = 500;
            return { error: { message: 'There was a problem creating order', error } }
        }
    }
}));
