import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRoute } from "./components/RoleRoute";
import { StudentLayout } from "./components/student/StudentLayout";
import { SuperAdminLayout } from "./components/superadmin/SuperAdminLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

// Super Admin Pages
import { SuperAdminDashboard } from "./pages/superadmin/SuperAdminDashboard";
import { InstitutesManagementPage } from "./pages/superadmin/InstitutesManagementPage";
import { SubscriptionPlansPage } from "./pages/superadmin/SubscriptionPlansPage";
import { PlatformBillingPage } from "./pages/superadmin/PlatformBillingPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminStudentsPage } from "./pages/admin/AdminStudentsPage";
import { AdminTeachersPage } from "./pages/admin/AdminTeachersPage";
import { AdminCoursesPage } from "./pages/admin/AdminCoursesPage";
import { AdminBatchesPage } from "./pages/admin/AdminBatchesPage";
import { AdminTimetablePage } from "./pages/admin/AdminTimetablePage";
import { AdminMaterialsPage } from "./pages/admin/AdminMaterialsPage";
import { AdminAttendancePage } from "./pages/admin/AdminAttendancePage";
import { AdminBrandingPage } from "./pages/admin/AdminBrandingPage";

// Student Pages
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { MyCoursesPage } from "./pages/student/MyCoursesPage";
import { MySubjectsPage } from "./pages/student/MySubjectsPage";
import { MyTeachersPage } from "./pages/student/MyTeachersPage";
import { StudentTimetablePage } from "./pages/student/StudentTimetablePage";
import { StudentMaterialsPage } from "./pages/student/StudentMaterialsPage";
import { StudentAttendancePage } from "./pages/student/StudentAttendancePage";
import { StudentTestsPage } from "./pages/student/StudentTestsPage";
import { OnlineExamInterfacePage } from "./pages/student/OnlineExamInterfacePage";
import { StudentResultsPage } from "./pages/student/StudentResultsPage";
import { StudentFeesPage } from "./pages/student/StudentFeesPage";
import { StudentNotificationsPage } from "./pages/student/StudentNotificationsPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Platform Super Admin Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRole="SUPER_ADMIN" />}>
              <Route path="/superadmin" element={<SuperAdminLayout />}>
                <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="institutes" element={<InstitutesManagementPage />} />
                <Route path="plans" element={<SubscriptionPlansPage />} />
                <Route path="invoices" element={<PlatformBillingPage />} />
              </Route>
            </Route>
          </Route>

          {/* Institute Admin Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRole="ADMIN" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="teachers" element={<AdminTeachersPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="batches" element={<AdminBatchesPage />} />
                <Route path="timetable" element={<AdminTimetablePage />} />
                <Route path="materials" element={<AdminMaterialsPage />} />
                <Route path="attendance" element={<AdminAttendancePage />} />
                <Route path="branding" element={<AdminBrandingPage />} />
              </Route>
            </Route>
          </Route>

          {/* Student Dedicated Full-Screen Exam Attempt */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRole="STUDENT" />}>
              <Route path="/student/tests/:testId/attempt" element={<OnlineExamInterfacePage />} />
            </Route>
          </Route>

          {/* Student Protected Routes with StudentLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRole="STUDENT" />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="courses" element={<MyCoursesPage />} />
                <Route path="subjects" element={<MySubjectsPage />} />
                <Route path="teachers" element={<MyTeachersPage />} />
                <Route path="timetable" element={<StudentTimetablePage />} />
                <Route path="materials" element={<StudentMaterialsPage />} />
                <Route path="attendance" element={<StudentAttendancePage />} />
                <Route path="tests" element={<StudentTestsPage />} />
                <Route path="results" element={<StudentResultsPage />} />
                <Route path="results/:testId" element={<StudentResultsPage />} />
                <Route path="fees" element={<StudentFeesPage />} />
                <Route path="notifications" element={<StudentNotificationsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Default fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
