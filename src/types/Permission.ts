export type Request = {
  id?: string;
  userId: string;
  attentionToId?: string;
  startDate: string;
  endDate: string;
  status: "pending" | "reviewed" | "approved" | "declined";
  type: "leave" | "log";
  leaveType?: LeaveType;
  memo?: string;
  timestamp: number;
  handoverId?: string;
};

export enum LeaveType {
  "Annual Leave" = "Annual Leave",
  "Casual Leave" = "Casual Leave",
  "Maternity Leave" = "Maternity Leave",
  "Paternity Leave" = "Parternity Leave",
  "Study Leave" = "Study Leave",
  "Study Leave Without Pay" = "Study Leave Without Pay",
  "Meditation Leave" = "Meditation Leave",
  "Sick Leave" = "Sick Leave",
  "Compassionate Leave" = "Compassionate Leave",
  "Leave of Absence" = "Leave of Absence",
}
export type Period = {
  startDate: string;
  endDate: string;
};
export type LeaveDay = {
  date: string;
  type: LeaveType;
};

export type Permission = {
  leaveDays?: LeaveDay[];
  logAllowance?: {
    period: Period;
    expires: number;
  };
};
