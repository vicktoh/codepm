import { Timestamp } from "firebase/firestore";

export interface Workplan {
   title: string;
   type: string;
   id: string;
   dateCreated: Timestamp | Date
}