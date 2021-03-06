import { TaskStatus, WorkplanType } from "../types/Project";

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
  Communications: "rgba(245, 235, 138, 1)",
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
