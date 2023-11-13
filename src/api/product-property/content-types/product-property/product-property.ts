// Interface automatically generated by schemas-to-ts

import { Product } from '../../../product/content-types/product/product';
import { Media } from '../../../../common/schemas-to-ts/Media';
import { Product_Plain } from '../../../product/content-types/product/product';
import { AdminPanelRelationPropertyModification } from '../../../../common/schemas-to-ts/AdminPanelRelationPropertyModification';

export interface ProductProperty {
  id: number;
  attributes: {
    createdAt: Date;    updatedAt: Date;    publishedAt?: Date;    product?: { data: Product };
    name: string;
    image?: { data: Media };
  };
}
export interface ProductProperty_Plain {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  product?: Product_Plain;
  name: string;
  image?: Media;
}

export interface ProductProperty_NoRelations {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  product?: number;
  name: string;
  image?: number;
}

export interface ProductProperty_AdminPanelLifeCycle {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  product?: AdminPanelRelationPropertyModification<Product_Plain>;
  name: string;
  image?: AdminPanelRelationPropertyModification<Media>;
}
