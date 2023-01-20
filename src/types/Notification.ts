import { Timestamp } from "firebase/firestore";

export type Notification = {
  id?: string;
  title: string;
  description?: string;
  linkTo?: string;
  reciepientId: string;
  timestamp: number | Timestamp;
  read: boolean;
};

export type NotificationPayload = {
  date: string;
  title: string;
  action: string;
  message: string;
};
export type EmailPayLoad = {
  to: string;
  data: NotificationPayload;
};
