import { Timestamp } from "firebase/firestore";

export type Log = {
  userId: string;
  timeStamp: number;
  dateUpdated: Timestamp;
  activity: string[];
  dateString: string;
};

export type LogState = {
  logs: Log[];
  logMap: Record<string, Log>;
};
export type LogFormType = {
  title: string;
  date: string;
};
