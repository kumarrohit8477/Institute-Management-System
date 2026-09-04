import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import { BottomTabBar } from "../components/Header";
import { useAuth } from "../hooks/useAuth";

// Student Screens
import { DashboardScreen } from "../screens/main/DashboardScreen";
import { CoursesScreen } from "../screens/main/CoursesScreen";
import { SubjectsScreen, TeachersScreen } from "../screens/main/SubjectsScreen";
import { TimetableScreen, MaterialsScreen, AttendanceScreen } from "../screens/main/TimetableScreen";
import { TestsScreen } from "../screens/main/TestsScreen";
import { ExamAttemptScreen, ResultScreen } from "../screens/main/ExamAttemptScreen";
import { FeesScreen, NotificationsScreen, ProfileScreen } from "../screens/main/FeesScreen";

type StudentTab = "dashboard" | "tests" | "fees" | "notifications" | "profile";
type StudentSubScreen =
  | "timetable" | "materials" | "attendance"
  | "courses" | "subjects" | "teachers"
  | "attempt" | "result";

const STUDENT_TABS = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "tests", label: "Tests", icon: "📝" },
  { id: "fees", label: "Fees", icon: "💳" },
  { id: "notifications", label: "Alerts", icon: "🔔" },
  { id: "profile", label: "Profile", icon: "👤" },
];

export const StudentNavigator: React.FC = () => {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<StudentTab>("dashboard");
  const [subScreen, setSubScreen] = useState<StudentSubScreen | null>(null);
  const [screenParams, setScreenParams] = useState<any>({});

  const navigateTo = (screen: string, params?: any) => {
    setScreenParams(params || {});
    setSubScreen(screen as StudentSubScreen);
  };

  const goBack = () => {
    setSubScreen(null);
    setScreenParams({});
  };

  const handleFinishExam = (testId: string) => {
    setScreenParams({ testId });
    setSubScreen("result");
  };

  const isCbtAttempt = subScreen === "attempt";

  const renderScreen = () => {
    if (subScreen) {
      switch (subScreen) {
        case "timetable": return <TimetableScreen onBack={goBack} />;
        case "materials": return <MaterialsScreen onBack={goBack} />;
        case "attendance": return <AttendanceScreen onBack={goBack} />;
        case "courses": return <CoursesScreen onBack={goBack} />;
        case "subjects": return <SubjectsScreen onBack={goBack} />;
        case "teachers": return <TeachersScreen onBack={goBack} />;
        case "attempt":
          return (
            <ExamAttemptScreen
              testId={screenParams.testId}
              onFinish={handleFinishExam}
              onBack={goBack}
            />
          );
        case "result":
          return <ResultScreen testId={screenParams.testId} onBack={goBack} />;
      }
    }

    switch (currentTab) {
      case "dashboard":
        return <DashboardScreen onNavigate={navigateTo} />;
      case "tests":
        return <TestsScreen onNavigate={navigateTo} onBack={() => setCurrentTab("dashboard")} />;
      case "fees":
        return <FeesScreen onBack={() => setCurrentTab("dashboard")} />;
      case "notifications":
        return <NotificationsScreen onBack={() => setCurrentTab("dashboard")} />;
      case "profile":
        return <ProfileScreen onBack={logout} />;
      default:
        return <DashboardScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>{renderScreen()}</View>
      {!isCbtAttempt && (
        <BottomTabBar
          currentTab={subScreen ? "" : currentTab}
          onSelectTab={(tab) => {
            setSubScreen(null);
            setCurrentTab(tab as StudentTab);
          }}
          tabs={STUDENT_TABS}
          accentColor={Colors.student.primary}
        />
      )}
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
