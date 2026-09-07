import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import { BottomTabBar } from "../components/Header";
import { useAuth } from "../hooks/useAuth";

// Admin Screens
import { AdminDashboardScreen } from "../screens/admin/dashboard";
import { AdminStudentsScreen } from "../screens/admin/student";
import { AdminTeachersScreen } from "../screens/admin/faculty";
import { AdminCoursesScreen } from "../screens/admin/courses";
import { AdminSubjectsScreen } from "../screens/admin/subjects";
import { AdminBatchesScreen } from "../screens/admin/batch";
import { AdminRoomsScreen } from "../screens/admin/room";
import { AdminTimetableScreen } from "../screens/admin/schedule";
import { AdminMaterialsScreen } from "../screens/admin/study_material";
import { AdminFeesScreen } from "../screens/admin/fees";
import { AdminProfileScreen } from "../screens/admin/profile";

type AdminTab = "dashboard" | "students" | "academics" | "reports" | "profile";
type AdminSubScreen =
  | "students"
  | "teachers"
  | "courses"
  | "subjects"
  | "batches"
  | "rooms"
  | "timetable"
  | "materials"
  | "fees";

const ADMIN_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "students", label: "Students", icon: "👨‍🎓" },
  { id: "academics", label: "Academics", icon: "📚" },
  { id: "reports", label: "Fees", icon: "💳" },
  { id: "profile", label: "Profile", icon: "⚙️" },
];

export const AdminNavigator: React.FC = () => {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [subScreen, setSubScreen] = useState<AdminSubScreen | null>(null);

  const navigateTo = (screen: string) => {
    setSubScreen(screen as AdminSubScreen);
  };

  const goBack = () => {
    setSubScreen(null);
  };

  const renderScreen = () => {
    if (subScreen) {
      switch (subScreen) {
        case "students":
          return <AdminStudentsScreen onBack={goBack} />;
        case "teachers":
          return <AdminTeachersScreen onBack={goBack} />;
        case "courses":
          return <AdminCoursesScreen onBack={goBack} />;
        case "subjects":
          return <AdminSubjectsScreen onBack={goBack} />;
        case "batches":
          return <AdminBatchesScreen onBack={goBack} />;
        case "rooms":
          return <AdminRoomsScreen onBack={goBack} />;
        case "timetable":
          return <AdminTimetableScreen onBack={goBack} />;
        case "materials":
          return <AdminMaterialsScreen onBack={goBack} />;
        case "fees":
          return <AdminFeesScreen onBack={goBack} />;
      }
    }

    switch (currentTab) {
      case "dashboard":
        return <AdminDashboardScreen onNavigate={navigateTo} />;
      case "students":
        return <AdminStudentsScreen onBack={() => setCurrentTab("dashboard")} />;
      case "academics":
        return <AdminCoursesScreen onBack={() => setCurrentTab("dashboard")} />;
      case "reports":
        return <AdminFeesScreen onBack={() => setCurrentTab("dashboard")} />;
      case "profile":
        return <AdminProfileScreen onLogout={logout} />;
      default:
        return <AdminDashboardScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>{renderScreen()}</View>
      <BottomTabBar
        currentTab={subScreen ? "" : currentTab}
        onSelectTab={(tab) => {
          setSubScreen(null);
          setCurrentTab(tab as AdminTab);
        }}
        tabs={ADMIN_TABS}
        accentColor={Colors.admin.primary}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
