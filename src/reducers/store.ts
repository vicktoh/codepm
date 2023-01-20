import { configureStore } from "@reduxjs/toolkit";
import { Auth } from "../types/Auth";
import { Profile } from "../types/Profile";
import { User } from "../types/User";
import auth from "./authSlice";
import profile from "./profileSlice";
import users from "./usersSlice";
import conversations from "./conversationSlice";
import presence from "./presenceSlice";
import logs from "./logSlice";
import system from "./systemSlice";
import permission from "./permissionSlice";
import requisitions from "./requisitionsSlice";
import projects from "./projectSlice";
import vendors from "./vendorSlice";
import notifications from "./notificationSlice";
import { Conversation } from "../types/Conversation";
import { PresenceState } from "../types/Presence";
import { LogState } from "../types/Log";
import { System } from "../types/System";
import { Permission } from "../types/Permission";
import { Beneficiary, Requisition } from "../types/Requisition";
import { Project } from "../types/Project";
import { Notification } from "../types/Notification";

export const store = configureStore({
  reducer: {
    auth,
    profile,
    users,
    conversations,
    presence,
    logs,
    system,
    permission,
    requisitions,
    projects,
    vendors,
    notifications,
  },
});

export type StoreType = {
  auth: Auth | null;
  profile: Profile | null;
  users: { users: User[]; usersMap: Record<string, User | undefined> } | null;
  conversations: Conversation[] | null | [];
  presence: PresenceState | null;
  logs: LogState | null;
  system: System | null;
  permission: Permission | null;
  requisitions: Requisition[] | null;
  projects: Project[] | null;
  vendors: Record<string, Beneficiary>;
  notifications: Notification[] | null;
};

export type AppDispatch = typeof store.dispatch;
