import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";
import { ChatPage } from "../pages/ChatPage";
import { Dashboard } from "../pages/Dashboard";
import { LogsPage } from "../pages/LogsPage";
import { ProfilePage } from "../pages/ProfilePage";
import { Projects } from "../pages/Projects";
import { ProjectDetails } from "../pages/ProjectDetails";
import { Proposals } from "../pages/Proposals";
import { RequisitionPage } from "../pages/RequisitionPage";
import { TasksPage } from "../pages/TasksPage";
import { WorkplanPage } from "../pages/WorkplanPage";
import { DashboardHome } from "../pages/DashboardHome";
import { RequisitionLayout } from "../layout/RequisitionLayout";
import { UsersLayout } from "../layout/UsersLayout";
import { UserListsPage } from "../pages/UserListsPage";
import { UserProfilePage } from "../pages/UserProfilePage";
import { PermissionsPage } from "../pages/PermissionsPage";
import { RequisitionAdminLayout } from "../layout/RequisitionAdminLayout";
import { RequisitionAdminPage } from "../pages/RequisitionAdminPage";
import { RequisitionAnalytics } from "../pages/RequisitionAnalytics";
import { SystemPage } from "../pages/SystemPage";

export const MainNavigation = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="proposals" element={<Proposals />} />

          <Route path="media" element={<TasksPage />} />
          <Route path="projects">
            <Route index element={<Projects />} />
            <Route path=":projectId" element={<ProjectDetails />} />
            <Route path=":projectId/:workplanId" element={<WorkplanPage />} />
          </Route>
        </Route>
        <Route path="tasks" element={<TasksPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="requisitions" element={<RequisitionLayout />}>
          <Route index element={<RequisitionPage />} />
          <Route path="archive" element={<RequisitionPage />} />
        </Route>
        <Route path="users" element={<UsersLayout />}>
          <Route index element={<UserListsPage />} />
          <Route path="requests" element={<PermissionsPage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
        </Route>
        <Route path="requisition-admin" element={<RequisitionAdminLayout />}>
          <Route index element={<RequisitionAdminPage />} />
          <Route path="analytics" element={<RequisitionAnalytics />} />
        </Route>
        <Route path="system-settings" element={<SystemPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};
