import { Timestamp } from "firebase/firestore";

export type Profile = {
  email: string;
  displayName: string;
  photoUrl: string;
  designation: string;
  department: string;
  dateOfBirth: Timestamp | Date | number | string;
  phoneNumber: string;
  role?: UserRole;
  signatureUrl?: string;
  dateRegistered: string;
};

export enum UserRole {
  admin = "admin",
  finance = "finance",
  user = "user",
  budgetHolder = "budgetHolder",
  reviewer = "reviewer",
  master = "master",
  driver = "driver",
}
