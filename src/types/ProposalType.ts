import { Timestamp } from "firebase/firestore";
import { ProjectDocument } from "./Project";

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
  documents: ProjectDocument[];
  status: typeof STATUSES[number];
  creatorId: string;
};
