// Interface automatically generated by schemas-to-ts

import { Media } from '../../../../common/schemas-to-ts/Media';
import { Author } from '../../../author/content-types/author/author';
import { Author_Plain } from '../../../author/content-types/author/author';
import { AdminPanelRelationPropertyModification } from '../../../../common/schemas-to-ts/AdminPanelRelationPropertyModification';

export interface Article {
  id: number;
  attributes: {
    createdAt: Date;    updatedAt: Date;    publishedAt?: Date;    title: string;
    slug?: string;
    cover: { data: Media };
    author?: { data: Author };
    content?: string;
    introduction?: string;
    time_to_finish_reading?: number;
  };
}
export interface Article_Plain {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  title: string;
  slug?: string;
  cover: Media;
  author?: Author_Plain;
  content?: string;
  introduction?: string;
  time_to_finish_reading?: number;
}

export interface Article_NoRelations {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  title: string;
  slug?: string;
  cover: number;
  author?: number;
  content?: string;
  introduction?: string;
  time_to_finish_reading?: number;
}

export interface Article_AdminPanelLifeCycle {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  title: string;
  slug?: string;
  cover: AdminPanelRelationPropertyModification<Media>;
  author?: AdminPanelRelationPropertyModification<Author_Plain>;
  content?: string;
  introduction?: string;
  time_to_finish_reading?: number;
}
