import { Timestamp } from "firebase/firestore";

export type Profile = {
  displayName: string;
  photoUrl: string;
  designation: string;
  department: string;
  dateOfBirth: Timestamp | Date | number | string;
  phoneNumber: string;
  role?: UserRole;
  signatureUrl?: string;
};

export enum UserRole {
  admin = "admin",
  finance = "finance",
  user = "user",
  budgetHolder = "budgetHolder",
  master = "master",
}
