import { Timestamp } from "firebase/firestore";
export type ConversationType = "private" | "group";
export interface Conversation {
  timestamp: Timestamp | number;
  lastUpdated: number;
  members: string[];
  admins?: string[];
  creatorId: string;
  type: ConversationType;
  title?: string;
  unreadCount?: number;
  conversation?: Record<string, number | undefined>;
  chatCount: number;
  id?: string;
}
