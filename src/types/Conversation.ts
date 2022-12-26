import { Timestamp } from "firebase/firestore";
export type ConversationType = "private" | "group";
export interface Conversation {
  timestamp: Timestamp | number;
  lastUpdated: number;
  members: string[];
  creatorId: string;
  type: ConversationType;
  title?: string;
  unreadCount?: number;
  id?: string;
}
