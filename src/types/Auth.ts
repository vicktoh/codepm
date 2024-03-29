import { UserRole } from "./Profile";

export type Auth = {
  displayName: string;
  uid: string;
  photoUrl: string;
  role: UserRole;
  dateRegistered: string;
};
