// Interface automatically generated by schemas-to-ts

import { Media } from '../../../../common/schemas-to-ts/Media';
import { ProductVariant } from '../../../product-variant/content-types/product-variant/product-variant';
import { ProductProperty } from '../../../product-property/content-types/product-property/product-property';
import { PurchaseOption } from '../../../purchase-option/content-types/purchase-option/purchase-option';
import { ProductReview } from '../../../product-review/content-types/product-review/product-review';
import { ProductVariant_Plain } from '../../../product-variant/content-types/product-variant/product-variant';
import { ProductProperty_Plain } from '../../../product-property/content-types/product-property/product-property';
import { PurchaseOption_Plain } from '../../../purchase-option/content-types/purchase-option/purchase-option';
import { ProductReview_Plain } from '../../../product-review/content-types/product-review/product-review';
import { AdminPanelRelationPropertyModification } from '../../../../common/schemas-to-ts/AdminPanelRelationPropertyModification';

export enum Category {
  Gel = 'Gel',
  Dried = 'Dried',
  Gummies = 'Gummies',
  Clothing = 'Clothing',
  Accessory = 'Accessory',}

export interface Product {
  id: number;
  attributes: {
    createdAt: Date;    updatedAt: Date;    publishedAt?: Date;    name: string;
    images: { data: Media[] };
    videos?: { data: Media[] };
    category?: Category;
    countryOfOrigin?: string;
    upc?: string;
    expirationDate?: Date;
    tipsForStorage?: string;
    slug: string;
    product_variants: { data: ProductVariant[] };
    thumbnail?: { data: Media };
    variant_selection_text?: string;
    unit_property_selection_text?: string;
    product_properties: { data: ProductProperty[] };
    purchase_options?: { data: PurchaseOption[] };
    product_reviews: { data: ProductReview[] };
    rating?: number;
    healthBenefits?: string;
    ingredients?: string;
    description?: string;
    certifications?: string;
  };
}
export interface Product_Plain {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  name: string;
  images: Media[];
  videos?: Media[];
  category?: Category;
  countryOfOrigin?: string;
  upc?: string;
  expirationDate?: Date;
  tipsForStorage?: string;
  slug: string;
  product_variants: ProductVariant_Plain[];
  thumbnail?: Media;
  variant_selection_text?: string;
  unit_property_selection_text?: string;
  product_properties: ProductProperty_Plain[];
  purchase_options?: PurchaseOption_Plain[];
  product_reviews: ProductReview_Plain[];
  rating?: number;
  healthBenefits?: string;
  ingredients?: string;
  description?: string;
  certifications?: string;
}

export interface Product_NoRelations {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  name: string;
  images: number[];
  videos?: number[];
  category?: Category;
  countryOfOrigin?: string;
  upc?: string;
  expirationDate?: Date;
  tipsForStorage?: string;
  slug: string;
  product_variants: number[];
  thumbnail?: number;
  variant_selection_text?: string;
  unit_property_selection_text?: string;
  product_properties: number[];
  purchase_options?: number[];
  product_reviews: number[];
  rating?: number;
  healthBenefits?: string;
  ingredients?: string;
  description?: string;
  certifications?: string;
}

export interface Product_AdminPanelLifeCycle {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  name: string;
  images: AdminPanelRelationPropertyModification<Media>[];
  videos?: AdminPanelRelationPropertyModification<Media>[];
  category?: Category;
  countryOfOrigin?: string;
  upc?: string;
  expirationDate?: Date;
  tipsForStorage?: string;
  slug: string;
  product_variants: AdminPanelRelationPropertyModification<ProductVariant_Plain>;
  thumbnail?: AdminPanelRelationPropertyModification<Media>;
  variant_selection_text?: string;
  unit_property_selection_text?: string;
  product_properties: AdminPanelRelationPropertyModification<ProductProperty_Plain>;
  purchase_options?: AdminPanelRelationPropertyModification<PurchaseOption_Plain>;
  product_reviews: AdminPanelRelationPropertyModification<ProductReview_Plain>;
  rating?: number;
  healthBenefits?: string;
  ingredients?: string;
  description?: string;
  certifications?: string;
}
