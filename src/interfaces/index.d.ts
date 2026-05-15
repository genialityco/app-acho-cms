import type { Column } from "@tanstack/react-table";
import { BaseRecord } from "@refinedev/core";
import React from "react";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterOperator?: string;
    filterElement?: {
      component: React.ComponentType<any>;
      meta?: Record<string, any>;
    };
    style?: React.CSSProperties;
    width?: string | number;
  }
}

export interface ICategory {
  _id: string;
  title: string;
  valory: string;
}

export interface IPost {
  _id: string;
  title: string;
  content: string;
  status: "published" | "draft" | "rejected";
  category: { id: number };
}

export interface IPoster {
  _id: string;
  title: string;
  content: string;
  category: string;
  topic: string;
  institution: string;
  urlPdf: string;
  authors: any[]; //.,status: "published" | "draft" | "rejected";
}

export interface IEvent extends BaseRecord {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  organizationId: Number;
  //status: "published" | "draft" | "rejected";
  category: { id: number };
}

export interface IAgenda {
  _id: string;
  name: string;
  description: string;
  eventId: { _id: string; name?: string };
  startDate: Date;
  organizationId: Number;
  //status: "published" | "draft" | "rejected";
  category: { id: number };

  valory: string;
}

export interface IModule {
  _id: string;
  id?: string;
  votes: number;
  title: string;
  category: { id: string };
  topic: string;
  authors: string;
  urlPdf: string;
  startDate: string;
  status?: string;
  content?: string;
}

export interface ISpeaker {
  _id: string;
  names: string;
  description: string;
  location: string;
  eventId: { _id: string };
  imageUrl: string;
  isInternational: boolean;
  authors?: string[];
}

export interface INews {
  _id: string;
  title: string;
  content: string;
  organizationId: string;
  featuredImage: string;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

export interface IMember {
  _id: string;
  userId: string;
  organizationId: string;
  memberActive: boolean;
  properties: {
    specialty: string;
    idNumber: string;
    email: string;
    fullName: string;
    phone: string;
  };
}

export interface INotificationTemplate {
  _id: string;
  organizationId: string;
  title: string;
  body: string;
  data: Record<string, any>;
  isSent: boolean;
  totalSent: number;
  createdAt: string;
  updatedAt: string;
}

export interface IHighlight {
  _id?: string;
  name: string;
  organizationId: string;
  eventId: string;
  description: string;
  imageUrl: string;
  vimeoUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IQuestion {
  id: string; 
  type: "radio" | "text" | "checkbox"; 
  title: string; 
  options?: string[];
}

export interface ISurvey {
  _id: string; 
  title: string;
  questions: IQuestion[]; 
  isPublished: boolean; 
  isOpen: boolean; 
  organizationId: string; 
  eventId?: string;
  createdAt?: string; 
  updatedAt?: string; 
}

/* 
        "location": {
          "coordinates": {
            "latitude": 4.693273,
            "longitude": -74.034641
          },
          "address": "Ak. 9 #115-30, Bogotá, Colombia"
        },
        "_id": "6807d5a91c2e1e14b22da8b0",
        "name": "6to. Congreso Nacional de investigación en Hematología y Oncología",
        "description": "",
        "startDate": "2024-11-01T09:00:00.000Z",
        "endDate": "2024-11-03T12:00:00.000Z"*/

export interface ColumnButtonProps {
  column: Column<any, any>; // eslint-disable-line
}

export interface FilterElementProps {
  value: any; // eslint-disable-line
  onChange: (value: any) => void; // eslint-disable-line
}
