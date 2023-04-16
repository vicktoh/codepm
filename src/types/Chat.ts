import { Timestamp } from "firebase/firestore";

export type Chat = {
  timestamp: Timestamp | number;
  senderId: string;
  members?: string[];
  recieverId?: string;
  recipient?: string[];
  sender: {
    photoUrl: string;
    displayName: string;
  };
  text: string;
  attachement?: string;
  conversationId: string;
  id?: string;
};
