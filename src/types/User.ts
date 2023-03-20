import { Profile } from "./Profile";

export interface User extends Profile {
  userId: string;
  objectID?: string;
  blocked?: boolean;
}

export interface UserReference {
  displayName: string;
  userId: string;
  photoUrl?: string;
  username?: string;
  signatureUrl?: string;
}
