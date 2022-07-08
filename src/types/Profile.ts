import { Timestamp } from "firebase/firestore";

export type Profile = {
  displayName: string;
  photoUrl: string;
  designation: string;
  department: string;
  dateOfBirth: Timestamp | Date | number | string;
  phoneNumber: string;
};
