import { Chat } from "./Chat";
export type VehicleRequest = {
  id: string;
  date: string;
  purpose: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  status: "pending" | "declined" | "approved";
  chats?: Chat[];
  chatCount?: number;
  conversation?: Record<string, number>;
  userId: string;
  timestamp: number;
};
