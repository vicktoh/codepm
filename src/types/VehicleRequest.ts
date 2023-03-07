import { Chat } from "./Chat";
export type VehicleRequest = {
  id: string;
  date: string;
  purpose: string;
  origin: string;
  destination: string;
  startTime: number;
  endTime: number;
  status: "pending" | "declined" | "approved";
  chats?: Chat[];
  chatCount?: number;
  conversation?: Record<string, number>;
  userId: string;
  timestamp: number;
  datetimestamp: number;
};
