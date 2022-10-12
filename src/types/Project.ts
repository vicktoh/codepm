import { Timestamp } from "firebase/firestore";

export type ProjectDocument = {
  title: string;
  url: string;
  addedById: string;
  addedBy: string;
  dateAdded: number | Date | Timestamp;
};

export type Document = {
  title: string;
  url: string;
};

export type WorkplanType = "Communications" | "Implementation" | "Others";

export type ProjectWorkPlan = {
  type: WorkplanType;
  title: string;
  id?: string;
  dateAdded?: Timestamp;
};

export interface Project {
  id: string;
  title: string;
  description: string;
  funder: string;
  documents?: ProjectDocument[];
  budgetId?: string;
  workplans?: ProjectWorkPlan[];
  dateAdded: number | Date | Timestamp;
  budget?: {
    date: number;
    creator: string;
  };
}

export type WorkplanView = "table" | "kanban" | "calendar";

export enum WorkplanViewType {
  "table",
  "kanban",
  "calendar",
}
export enum TaskStatus {
  "planned" = "planned",
  "not-started" = "not-started",
  "ongoing" = "ongoing",
  "completed" = "completed",
}

export interface TodoItem {
  checked: boolean;
  label: string;
}

export type TimePeriod = {
  startDate?: string;
  dueDate: string;
};

export interface Task {
  workplanId: string;
  title: string;
  description?: string;
  assignees?: string[];
  dueDate?: TimePeriod;
  attachments?: Document[];
  history?: string[];
  status: TaskStatus;
  projectTitle: string;
  projectFunder: string;
  projectId: string;
  timestamp: Timestamp;
  id?: string;
  creatorId: string;
  todo?: TodoItem[];
}

export type KanbanColumn = {
  id: string | number;
  title: string;
  cards: Task[];
};

export type BudgetItem = {
  id?: string;
  description: string;
  activity: string;
  amount: number;
  code?: string;
  spent?: number;
};
