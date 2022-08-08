import { UserReference } from "./User";

export type RequisitionItem = {
  title: string;
  amount: number;
  budgetId?: string;
};

export type RequisitionAttachement = {
  title: string;
  name?: string;
  fileUrl?: string;
  uploaderId: string;
};

export type RequisitionStats = {
  pendingRetirement?: number;
  pendingRequisitions?: number;
  approvedRequisitions?: number;
  totalApprovedSum?: number;
  pendingRetirementSum?: number;
};
export enum RequisitionStatus {
  "pending" = "pending",
  "approved" = "approved",
  "budgetholder" = "budgetholder",
  "checked" = "checked",
  "paid" = "paid",
  "retirement-approved" = "retirement-approved",
  "retired" = "retired",
  "abandoned" = "abandoned",
}
export enum RequisitionCurrency {
  "NGN" = "NGN",
  "USD" = "USD",
  "GBP" = "GBP",
  "EUR" = "EUR",
}
export enum RequisitionType {
  "procurement request" = "procurement request",
  "travel request" = "travel request",
  "advance request" = "advance request",
  "per diem" = "advance request",
}
export interface Requisition {
  creatorId: string;
  id?: string;
  creator: UserReference;
  title: string;
  projectTitle?: string;
  acitivityTitle?: string;
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
  status: RequisitionStatus;
  type: RequisitionType;
  attachments?: RequisitionAttachement[];
  retired?: boolean;
  paid?: boolean;
  total: number;
  amountInWords: string;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  beneficiaryBank: string;
  currency: RequisitionCurrency;
  attentionTo?: string[];
  chatCount?: number;
  conversation?: Record<string, number>;
}

export type RequisitionFormValues = {
  step: number;
  date: string;
  title: Requisition["title"];
  items: Requisition["items"];
  type: Requisition["type"];
  attachments?: Requisition["attachments"];
  projectTitle: string;
  activityTitle: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccountNumber: string;
  currency: Requisition["currency"];
  attentionTo?: Requisition["attentionTo"];
};
