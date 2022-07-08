import { Timestamp } from "firebase/firestore";

export type ProposalStatus = {
  pending: "pending";
  "in-review": "in-review";
  submitted: "submitted";
  approved: "approved";
};
export const STATUSES = ["pending", "in-review", "submitted", "approved"];
export type ProposalType = {
  id?: string;
  title: string;
  description: string;
  dateAdded: number | Date | Timestamp;
  funder: string;
  fileUrl: string;
  status: typeof STATUSES[number];
};
