import { LeaveType } from "./Permission";

export interface System {
  logAllowanceDay: number;
  publicHolidays: { date: string; name: string; id?: string | number }[];
  logStartDate: string;
  leaveDays?: number;
  casualLeaveDays: number;
  maternityLeaveDays?: number;
  meditationLeaveDays?: number;
  studyLeaveWithoutPayDays?: number;
  paternityLeaveDays?: number;
  studyLeaveDays?: number;
  certificationLeaveDays?: number;
  sickLeaveDays?: number;
  compassionateLeaveDays?: number;
  leaveOfAbsence?: number;
}

export type LeaveTypeMap = Record<LeaveType, number>;
