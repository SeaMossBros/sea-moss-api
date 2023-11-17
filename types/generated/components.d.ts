import type { Schema, Attribute } from '@strapi/strapi';

export interface CartCartItemProperties extends Schema.Component {
  collectionName: 'components_cart_item_properties';
  info: {
    displayName: 'Cart Item Properties';
  };
  attributes: {
    product_property: Attribute.Relation<
      'cart.cart-item-properties',
      'oneToOne',
      'api::product-property.product-property'
    >;
    quantity: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }> &
      Attribute.DefaultTo<1>;
  };
}

export interface CartVariant extends Schema.Component {
  collectionName: 'components_cart_variants';
  info: {
    displayName: 'Cart Item Options';
    description: '';
  };
  attributes: {
    product_variant: Attribute.Relation<
      'cart.variant',
      'oneToOne',
      'api::product-variant.product-variant'
    >;
    quantity: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }> &
      Attribute.DefaultTo<1>;
    properties: Attribute.Component<'cart.cart-item-properties', true>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'cart.cart-item-properties': CartCartItemProperties;
      'cart.variant': CartVariant;
    }
  }
}
