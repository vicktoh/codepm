export type Request = {
  id?: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "declined";
  type: "leave" | "log";
  leaveType?: LeaveType;
  timestamp: number;
};

export enum LeaveType {
  "Annual Leave" = "Annual Leave",
  "Casual Leave" = "Casual Leave",
  "Maternity Leave" = "Maternity Leave",
  "Paternity Leave" = "Study Leave",
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
