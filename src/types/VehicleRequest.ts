import { Chat } from "./Chat";
export type VehicleRequest = {
  id: string;
  date: string;
  purpose: string;
  origin: string;
  destination: string;
  startTime: number;
  endTime: number;
  status: "pending" | "reviewed" | "declined" | "approved";
  chats?: Chat[];
  chatCount?: number;
  conversation?: Record<string, number>;
  userId: string;
  timestamp: number;
  datetimestamp: number;
  riders: string[];
  approvedBy?: string;
  approvedTimeStamp?: number;
  reviewerId: string;
  approverId: string;
  reviewedBy?: string;
  reviewedTimestamp?: number;
  declinedBy?: string;
  declinedTimestamp?: number;
  comments?: Chat[];
};
