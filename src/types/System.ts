export interface System {
  logAllowanceDay: number;
  publicHolidays?: string[];
  logStartDate: string;
  leaveDays?: number;
  casualLeaveDays: number;
  maternityLeaveDays?: number;
  paternityLeaveDays?: number;
  studyLeaveDays?: number;
  certificationLeaveDays?: number;
  sickLeaveDays?: number;
  compassionateLeaveDays?: number;
  leaveOfAbsence?: number;
}
