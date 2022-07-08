export type Request = {
  userId: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "declined";
  type: "leave" | "log";
};
export type Period = {
  startDate: string;
  endDate: string;
};
export type Permission = {
  leaveDays?: string[];
  logAllowance?: {
    period: Period;
    expires: number;
  };
};
