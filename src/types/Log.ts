import { Timestamp } from "firebase/firestore";

export type Log = {
  userId: string;
  timeStamp: number;
  dateUpdated: Timestamp | number;
  activity: string[];
  dateString: string;
  link?: string;
};

export type LogState = {
  logs: Log[];
  logMap: Record<string, Log>;
};
export type LogFormType = {
  title: string;
  date: string;
  link?: string;
};
