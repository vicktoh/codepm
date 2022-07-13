import { UserReference } from "./User";

export type RequisitionItem = {
  title: string;
  amount: number;
  budgetLine: string;
  budgetId?: string;
};

export type RequisitionAttachement = {
  title: string;
  name?: string;
  fileUrl?: string;
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
  "cash-advance" = "cash-advance",
  "requisition" = "requisition",
  "refund" = "refund",
}
export interface Requisition {
  creatorId: string;
  id?: string;
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
  status: RequisitionStatus;
  type: RequisitionType;
  attachments?: RequisitionAttachement[];
  retired?: boolean;
  paid?: boolean;
  total: number;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  beneficiaryBank: string;
  currency: RequisitionCurrency;
  attentionTo?: string[];
}

export type RequisitionFormValues = {
  step: number;
  date: string;
  title: Requisition["title"];
  items: Requisition["items"];
  type: Requisition["type"];
  attachments?: Requisition["attachments"];
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccountNumber: string;
  currency: Requisition["currency"];
  attentionTo?: Requisition["attentionTo"];
};
