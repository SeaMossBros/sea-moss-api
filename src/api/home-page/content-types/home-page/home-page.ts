// Interface automatically generated by schemas-to-ts

import { Media } from '../../../../common/schemas-to-ts/Media';
import { AdminPanelRelationPropertyModification } from '../../../../common/schemas-to-ts/AdminPanelRelationPropertyModification';

export interface HomePage {
  id: number;
  attributes: {
    createdAt: Date;    updatedAt: Date;    publishedAt?: Date;    hero_images: { data: Media[] };
  };
}
export interface HomePage_Plain {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  hero_images: Media[];
}

export interface HomePage_NoRelations {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  hero_images: number[];
}

export interface HomePage_AdminPanelLifeCycle {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  hero_images: AdminPanelRelationPropertyModification<Media>[];
}
