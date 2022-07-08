import { UserReference } from "./User";

export type RequisitionItem = {
  title: string;
  amount: number;
  budgetLine: string;
  budgetId: string;
};

export type RequisitionAttachement = {
  title: string;
  fileUrl?: string;
};

export interface Requisition {
  creatorId: string;
  creator: UserReference;
  title: string;
  project?: {
    title: string;
    projectId: string;
  };
  timestamp: number;
  lastUpdated: number;
  items: RequisitionItem[];
  checkedby?: UserReference;
  checkedById?: string;
  budgetHolderCheck?: UserReference;
  budgetHolderId?: string;
  approvedBy?: UserReference;
  approvedById?: string;
  checkedTimeStamp?: number;
  budgetHolderCheckedTimestamp?: number;
  approvedCheckedTimestamp?: number;
  status:
    | "pending"
    | "approved"
    | "budgetholder"
    | "abandoned"
    | "checked"
    | "retired"
    | "paid";
  attachments?: RequisitionAttachement[];
  retired?: boolean;
  paid?: boolean;
}
