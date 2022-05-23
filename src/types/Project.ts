import { Timestamp } from "firebase/firestore";

export type ProjectDocument = {
   title: string;
   url: string;
   addedById: string;
   addedBy: string;
   dateAdded: number | Date | Timestamp
}

export type ProjectWorkPlan = {
   type: 'Implementation' | 'Communications' | 'Other';
   title: string;
   projectId: string;
}



export interface Project  {
   id: string;
   title: string;
   description: string;
   funder: string;
   documents?: ProjectDocument[];
   budgetId?: string;
   workPlans?: ProjectWorkPlan[];
   dateAdded: number | Date | Timestamp;

}