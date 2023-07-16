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
import { BudgetPage } from "../pages/BudgetPage";
import { RequestLayout } from "../layout/RequestLayout";
import { RequestsPage } from "../pages/RequestsPage";
import { VehicleRequests } from "../pages/VehicleRequests";
import { RequestAdminLayout } from "../layout/RequestAdminLayout";
import { VehicleAdmin } from "../pages/VehicleAdmin";
import { useAppSelector } from "../reducers/types";
import { UserAttendancePage } from "../pages/UserAttendancePage";
import { Attendance } from "../components/Attendance";

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
            <Route path=":projectId/budget" element={<BudgetPage />} />
          </Route>
        </Route>
        <Route path="tasks" element={<TasksPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="requests" element={<RequestLayout />}>
          <Route index element={<RequestsPage />} />
          <Route path=":requestId" element={<RequestsPage />} />
          <Route path="vehicle" element={<VehicleRequests />} />
          <Route path="vehicle/:requestId" element={<VehicleRequests />} />
        </Route>
        <Route path="requests-admin" element={<RequestAdminLayout />}>
          <Route index element={<PermissionsPage />} />
          <Route path=":requestId" element={<PermissionsPage />} />
          <Route path="vehicle" element={<VehicleAdmin />} />
          <Route path="vehicle/:requestId" element={<VehicleAdmin />} />
        </Route>
        <Route path="requisitions" element={<RequisitionLayout />}>
          <Route index element={<RequisitionPage />} />
          <Route path=":requisitionId" element={<RequisitionPage />} />
          <Route path="archive" element={<RequisitionPage />} />
        </Route>
        <Route path="users" element={<UsersLayout />}>
          <Route index element={<UserListsPage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
          <Route path="attendance/:userId" element={<UserAttendancePage />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>
        <Route path="requisition-admin" element={<RequisitionAdminLayout />}>
          <Route index element={<RequisitionAdminPage />} />
          <Route path=":requisitionId" element={<RequisitionAdminPage />} />
          <Route path="analytics" element={<RequisitionAnalytics />} />
        </Route>
        <Route path="system-settings" element={<SystemPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};
