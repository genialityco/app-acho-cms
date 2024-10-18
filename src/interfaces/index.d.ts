import type { Column } from "@tanstack/react-table";

export interface ICategory {
  id: number;
  title: string;
  valory: string;
}

export interface IPost {
  id: number;
  title: string;
  content: string;
  status: "published" | "draft" | "rejected";
  category: { id: number };
}

export interface IEvent {
  id: number;
  _id: number;
  name: string;
  description: string;
  startDate: Date;
  organizationId: Number;
  //status: "published" | "draft" | "rejected";
  category: { id: number };
}

export interface IAgenda {
  id: number;
  _id: number;
  name: string;
  description: string;
  startDate: Date;
  organizationId: Number;
  //status: "published" | "draft" | "rejected";
  category: { id: number };
  valory: string;
}



/* 
        "location": {
          "coordinates": {
            "latitude": 4.693273,
            "longitude": -74.034641
          },
          "address": "Ak. 9 #115-30, Bogotá, Colombia"
        },
        "_id": "66f1e0b57c2e2fbdefa21271",
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
