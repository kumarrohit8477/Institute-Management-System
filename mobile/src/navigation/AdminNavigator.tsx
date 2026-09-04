import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import { BottomTabBar } from "../components/Header";
import { useAuth } from "../hooks/useAuth";

// Admin Screens
import { AdminDashboardScreen } from "../screens/admin/AdminDashboardScreen";
import { AdminStudentsScreen } from "../screens/admin/AdminStudentsScreen";
import { AdminTeachersScreen } from "../screens/admin/AdminTeachersScreen";
import { AdminCoursesScreen } from "../screens/admin/AdminCoursesScreen";
import { AdminBatchesScreen } from "../screens/admin/AdminBatchesScreen";
import { AdminFeesScreen } from "../screens/admin/AdminFeesScreen";
import { AdminProfileScreen } from "../screens/admin/AdminProfileScreen";

type AdminTab = "dashboard" | "students" | "academics" | "reports" | "profile";
type AdminSubScreen = "teachers" | "courses" | "batches" | "fees";

const ADMIN_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "students", label: "Students", icon: "👨‍🎓" },
  { id: "academics", label: "Academics", icon: "📚" },
  { id: "reports", label: "Reports", icon: "📋" },
  { id: "profile", label: "Profile", icon: "⚙️" },
];

export const AdminNavigator: React.FC = () => {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [subScreen, setSubScreen] = useState<AdminSubScreen | null>(null);
  const [screenParams, setScreenParams] = useState<any>({});

  const navigateTo = (screen: string, params?: any) => {
    setScreenParams(params || {});
    setSubScreen(screen as AdminSubScreen);
  };

  const goBack = () => {
    setSubScreen(null);
    setScreenParams({});
  };

  const renderScreen = () => {
    if (subScreen) {
      switch (subScreen) {
        case "teachers": return <AdminTeachersScreen onBack={goBack} />;
        case "courses": return <AdminCoursesScreen onBack={goBack} />;
        case "batches": return <AdminBatchesScreen onBack={goBack} />;
        case "fees": return <AdminFeesScreen onBack={goBack} />;
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
