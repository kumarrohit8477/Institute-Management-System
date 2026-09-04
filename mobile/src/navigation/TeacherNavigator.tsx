import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import { BottomTabBar } from "../components/Header";
import { useAuth } from "../hooks/useAuth";

// Teacher Screens
import { TeacherDashboardScreen } from "../screens/teacher/TeacherDashboardScreen";
import { TeacherBatchesScreen } from "../screens/teacher/TeacherBatchesScreen";
import { TeacherTimetableScreen } from "../screens/teacher/TeacherTimetableScreen";
import { TeacherAttendanceScreen } from "../screens/teacher/TeacherAttendanceScreen";
import { TeacherProfileScreen } from "../screens/teacher/TeacherProfileScreen";

type TeacherTab = "dashboard" | "batches" | "timetable" | "profile";
type TeacherSubScreen = "attendance";

const TEACHER_TABS = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "batches", label: "Batches", icon: "👥" },
  { id: "timetable", label: "Schedule", icon: "📅" },
  { id: "profile", label: "Profile", icon: "👤" },
];

export const TeacherNavigator: React.FC = () => {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<TeacherTab>("dashboard");
  const [subScreen, setSubScreen] = useState<TeacherSubScreen | null>(null);
  const [screenParams, setScreenParams] = useState<any>({});

  const navigateTo = (screen: string, params?: any) => {
    setScreenParams(params || {});
    setSubScreen(screen as TeacherSubScreen);
  };

  const goBack = () => {
    setSubScreen(null);
    setScreenParams({});
  };

  const renderScreen = () => {
    if (subScreen) {
      switch (subScreen) {
        case "attendance":
          return (
            <TeacherAttendanceScreen
              onBack={goBack}
              batchId={screenParams.batchId}
              batchName={screenParams.batchName}
            />
          );
      }
    }

    switch (currentTab) {
      case "dashboard":
        return <TeacherDashboardScreen onNavigate={navigateTo} />;
      case "batches":
        return <TeacherBatchesScreen onBack={() => setCurrentTab("dashboard")} onNavigate={navigateTo} />;
      case "timetable":
        return <TeacherTimetableScreen onBack={() => setCurrentTab("dashboard")} />;
      case "profile":
        return <TeacherProfileScreen onLogout={logout} />;
      default:
        return <TeacherDashboardScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>{renderScreen()}</View>
      <BottomTabBar
        currentTab={subScreen ? "" : currentTab}
        onSelectTab={(tab) => {
          setSubScreen(null);
          setCurrentTab(tab as TeacherTab);
        }}
        tabs={TEACHER_TABS}
        accentColor={Colors.teacher.primary}
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
