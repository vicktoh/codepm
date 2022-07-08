import { Profile } from "./Profile";

export interface User extends Profile {
  userId: string;
}

export interface UserReference {
  displayName: string;
  userId: string;
  photoUrl?: string;
  username?: string;
}
