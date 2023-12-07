// Interface automatically generated by schemas-to-ts

import { Media } from '../../../../common/schemas-to-ts/Media';
import { Author } from '../../../author/content-types/author/author';
import { Author_Plain } from '../../../author/content-types/author/author';
import { AdminPanelRelationPropertyModification } from '../../../../common/schemas-to-ts/AdminPanelRelationPropertyModification';

export interface Article {
  id: number;
  attributes: {
    createdAt: Date;    updatedAt: Date;    publishedAt?: Date;    title: string;
    introduction?: string;
    slug?: string;
    cover: { data: Media };
    content: string;
    author?: { data: Author };
  };
}
export interface Article_Plain {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  title: string;
  introduction?: string;
  slug?: string;
  cover: Media;
  content: string;
  author?: Author_Plain;
}

export interface Article_NoRelations {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  title: string;
  introduction?: string;
  slug?: string;
  cover: number;
  content: string;
  author?: number;
}

export interface Article_AdminPanelLifeCycle {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  title: string;
  introduction?: string;
  slug?: string;
  cover: AdminPanelRelationPropertyModification<Media>;
  content: string;
  author?: AdminPanelRelationPropertyModification<Author_Plain>;
}
