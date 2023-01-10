import { TaskStatus, WorkplanType } from "../types/Project";
import { System } from "../types/System";

export const COLOR_SPECTRUM_TAGS = [
  "#FFA096",
  "#66B1F3",
  "#9B5CCB",
  "#F886BB",
  "#FFBEF3",
];

export const WORKPLAN_TYPES: WorkplanType[] = [
  "Communications",
  "Implementation",
  "Others",
];

export const WORKPLAN_COLORS: Record<WorkplanType, string> = {
  Communications: "tertiary.400",
  Implementation: "rgba(161, 204, 217, 1)",
  Others: "rgba(234, 129, 129, 1)",
};

export const STATUS_COLORSCHEME: Record<TaskStatus, string> = {
  planned: "gray",
  "not-started": "red",
  completed: "green",
  ongoing: "orange",
};

export const FILL_DAY_COLOR = "#6DF8AB";
export const MISSED_DAY_COLOR = "#EA8181";
export const PUBLIC_HOLIDAY_COLOR = "#5AB7D4";
export const LEAVE_DAY_COLOR = "#E7D74C";
export const CALENDAR_HEADER = ["S", "M", "T", "W", "T", "F", "S"];
export const ALGOLIA_APP_ID = "UO4LVZ6V72";
export const ALGOLIA_SEARCH_API_KEY = "4df18395c02e8cda29ac8aae7a22b0d4";
export const WHITE_LIST = [
  "connecteddevelopment.org",
  "ifollowthemoney.org",
  "gmail.com",
  "turing.com",
  "procurementmonitor.org",
];

export const SystemFields: Record<keyof System, string> = {
  casualLeaveDays: "Number of Casual Leave days allowed",
  leaveDays: "Number of anual leave days allowed",
  compassionateLeaveDays: "Number of compassionate leave days allowed",
  maternityLeaveDays: "Number of maternity leave days allowed",
  paternityLeaveDays: "Number of paternity leave days allowed",
  certificationLeaveDays:
    "Number of certification/examination leave days allowed",
  sickLeaveDays: "Number of sick leave days allowed",
  logAllowanceDay: "Number of back logs allowed to be filled",
  logStartDate: "Day to startCounting Logs",
  publicHolidays: "Public Holidays in this year",
  leaveOfAbsence: "Number of leave of absence allowed",
  studyLeaveDays: "Number of study leave days allowed",
  studyLeaveWithoutPayDays: "Number of study leave days without pay allowed",
  meditationLeaveDays: "Number of meditation leave days without pay allowed",
};
