import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/src/context/AuthContext";
import { useAuth } from "@/src/hooks/useAuth";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { RoleRoute } from "@/src/components/RoleRoute";
import { StudentLayout } from "@/src/components/student/StudentLayout";
import { SuperAdminLayout } from "@/src/components/superadmin/SuperAdminLayout";
import { AdminLayout } from "@/src/components/admin/AdminLayout";
import { LandingPage } from "@/src/pages/LandingPage";
import { LoginPage } from "@/src/pages/LoginPage";
import { RegisterPage } from "@/src/pages/RegisterPage";
import { ForgotPasswordPage } from "@/src/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/src/pages/ResetPasswordPage";
import { SuperAdminSetupPage } from "@/src/pages/superadmin/SuperAdminSetupPage";
import { UnauthorizedPage } from "@/src/pages/UnauthorizedPage";

// Super Admin Pages
import { SuperAdminDashboard } from "@/src/pages/superadmin/SuperAdminDashboard";
import { InstitutesManagementPage } from "@/src/pages/superadmin/InstitutesManagementPage";
import { SubscriptionPlansPage } from "@/src/pages/superadmin/SubscriptionPlansPage";
import { PlatformBillingPage } from "@/src/pages/superadmin/PlatformBillingPage";

// Admin Pages
import { AdminDashboard } from "@/src/pages/admin/AdminDashboard";
import { AdminStudentsPage } from "@/src/pages/admin/AdminStudentsPage";
import { AdminTeachersPage } from "@/src/pages/admin/AdminTeachersPage";
import { AdminCoursesPage } from "@/src/pages/admin/AdminCoursesPage";
import { AdminSubjectsPage } from "@/src/pages/admin/AdminSubjectsPage";
import { AdminBatchesPage } from "@/src/pages/admin/AdminBatchesPage";
import { AdminCreateBatchPage } from "@/src/pages/admin/AdminCreateBatchPage";
import { AdminBatchDetailPage } from "@/src/pages/admin/AdminBatchDetailPage";
import { AdminRoomsPage } from "@/src/pages/admin/AdminRoomsPage";
import { AdminTimetablePage } from "@/src/pages/admin/AdminTimetablePage";
import { AdminMaterialsPage } from "@/src/pages/admin/AdminMaterialsPage";
import { AdminAttendancePage } from "@/src/pages/admin/AdminAttendancePage";
import { AdminBrandingPage } from "@/src/pages/admin/AdminBrandingPage";
import { AdminProfilePage } from "@/src/pages/admin/AdminProfilePage";

// Teacher Pages
import { TeacherLayout } from "@/src/components/teacher/TeacherLayout";
import { TeacherDashboardPage } from "@/src/pages/teacher/TeacherDashboardPage";
import { TeacherBatchesPage } from "@/src/pages/teacher/TeacherBatchesPage";
import { TeacherTimetablePage } from "@/src/pages/teacher/TeacherTimetablePage";

// Student Pages
import { StudentDashboard } from "@/src/pages/student/StudentDashboard";
import { MyCoursesPage } from "@/src/pages/student/MyCoursesPage";
import { MySubjectsPage } from "@/src/pages/student/MySubjectsPage";
import { MyTeachersPage } from "@/src/pages/student/MyTeachersPage";
import { StudentTimetablePage } from "@/src/pages/student/StudentTimetablePage";
import { StudentMaterialsPage } from "@/src/pages/student/StudentMaterialsPage";
import { StudentAttendancePage } from "@/src/pages/student/StudentAttendancePage";
import { StudentTestsPage } from "@/src/pages/student/StudentTestsPage";
import { OnlineExamInterfacePage } from "@/src/pages/student/OnlineExamInterfacePage";
import { StudentResultsPage } from "@/src/pages/student/StudentResultsPage";
import { StudentFeesPage } from "@/src/pages/student/StudentFeesPage";
import { StudentNotificationsPage } from "@/src/pages/student/StudentNotificationsPage";

/**
 * Keyed by the authenticated user's id so that switching accounts (login as
 * a different user without a full page reload) forces every route/page
 * component to unmount and remount. Without this, React Router keeps the
 * same component instances mounted when the new session redirects to the
 * same path (e.g. ADMIN -> ADMIN), so any page that loads its data in a
 * mount-only useEffect keeps rendering data fetched for the previous user.
 */
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes key={user?.id ?? "anonymous"}>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/super-admin/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/super-admin/reset-password" element={<ResetPasswordPage />} />
      <Route path="/super-admin/setup" element={<SuperAdminSetupPage />} />
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
            <Route path="subjects" element={<AdminSubjectsPage />} />
            <Route path="batches" element={<AdminBatchesPage />} />
            <Route path="batches/new" element={<AdminCreateBatchPage />} />
            <Route path="batches/:id" element={<AdminBatchDetailPage />} />
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="timetable" element={<AdminTimetablePage />} />
            <Route path="materials" element={<AdminMaterialsPage />} />
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="branding" element={<AdminBrandingPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="institute" element={<Navigate to="/admin/profile" replace />} />
          </Route>
        </Route>
      </Route>

      {/* Teacher Portal Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRole="TEACHER" />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboardPage />} />
            <Route path="batches" element={<TeacherBatchesPage />} />
            <Route path="timetable" element={<TeacherTimetablePage />} />
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
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
