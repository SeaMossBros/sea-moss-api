'use strict'

module.exports = {
    redirect: async (ctx, next) => {
        const { shortCode } = ctx.params;
        console.log('shorCode', shortCode);
        // Find the original URL by shortCode
        const entries = await strapi.entityService.findMany('api::url-shortner.url-shortner', { 
            filters: {
                short_code: shortCode
            }
        });

        const entry = entries[0];
        if (!entry) {
            return ctx.notFound('URL not found');
        }

        ctx.redirect(entry.url);
    }
}