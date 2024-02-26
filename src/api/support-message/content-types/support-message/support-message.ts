// Interface automatically generated by schemas-to-ts

export interface SupportMessage {
  id: number;
  attributes: {
    createdAt: Date;    updatedAt: Date;    publishedAt?: Date;    name?: string;
    email?: string;
    subject?: string;
    body?: string;
  };
}
export interface SupportMessage_Plain {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  name?: string;
  email?: string;
  subject?: string;
  body?: string;
}

export interface SupportMessage_NoRelations {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  name?: string;
  email?: string;
  subject?: string;
  body?: string;
}

export interface SupportMessage_AdminPanelLifeCycle {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  name?: string;
  email?: string;
  subject?: string;
  body?: string;
}