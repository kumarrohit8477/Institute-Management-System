import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { BottomTabBar } from "../components/Header";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { DashboardScreen } from "../screens/main/DashboardScreen";
import { CoursesScreen } from "../screens/main/CoursesScreen";
import { SubjectsScreen, TeachersScreen } from "../screens/main/SubjectsScreen";
import { TimetableScreen, MaterialsScreen, AttendanceScreen } from "../screens/main/TimetableScreen";
import { TestsScreen } from "../screens/main/TestsScreen";
import { ExamAttemptScreen, ResultScreen } from "../screens/main/ExamAttemptScreen";
import { FeesScreen, NotificationsScreen, ProfileScreen } from "../screens/main/FeesScreen";

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [screenParams, setScreenParams] = useState<any>({});

  if (isLoading) {
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: "16px", color: "#3b82f6" }}>Loading IMS Mobile...</div>
      </ScreenWrapper>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const navigateTo = (screen: string, params?: any) => {
    setScreenParams(params || {});
    setActiveSubScreen(screen);
  };

  const handleFinishExam = (testId: string) => {
    setScreenParams({ testId });
    setActiveSubScreen("result");
  };

  const renderContent = () => {
    if (activeSubScreen) {
      switch (activeSubScreen) {
        case "timetable":
          return <TimetableScreen onBack={() => setActiveSubScreen(null)} />;
        case "materials":
          return <MaterialsScreen onBack={() => setActiveSubScreen(null)} />;
        case "attendance":
          return <AttendanceScreen onBack={() => setActiveSubScreen(null)} />;
        case "courses":
          return <CoursesScreen onBack={() => setActiveSubScreen(null)} />;
        case "subjects":
          return <SubjectsScreen onBack={() => setActiveSubScreen(null)} />;
        case "teachers":
          return <TeachersScreen onBack={() => setActiveSubScreen(null)} />;
        case "tests":
          return <TestsScreen onNavigate={navigateTo} onBack={() => setActiveSubScreen(null)} />;
        case "attempt":
          return (
            <ExamAttemptScreen
              testId={screenParams.testId}
              onFinish={handleFinishExam}
              onBack={() => setActiveSubScreen(null)}
            />
          );
        case "result":
          return <ResultScreen testId={screenParams.testId} onBack={() => setActiveSubScreen(null)} />;
        case "fees":
          return <FeesScreen onBack={() => setActiveSubScreen(null)} />;
        case "notifications":
          return <NotificationsScreen onBack={() => setActiveSubScreen(null)} />;
        default:
          return <DashboardScreen onNavigate={navigateTo} />;
      }
    }

    switch (currentTab) {
      case "dashboard":
        return <DashboardScreen onNavigate={navigateTo} />;
      case "academics":
        return <CoursesScreen onBack={() => setCurrentTab("dashboard")} />;
      case "tests":
        return <TestsScreen onNavigate={navigateTo} onBack={() => setCurrentTab("dashboard")} />;
      case "fees":
        return <FeesScreen onBack={() => setCurrentTab("dashboard")} />;
      case "notifications":
        return <NotificationsScreen onBack={() => setCurrentTab("dashboard")} />;
      case "profile":
        return <ProfileScreen onBack={() => setCurrentTab("dashboard")} />;
      default:
        return <DashboardScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <ScreenWrapper>
      <div style={{ flex: 1, overflowY: "auto" }}>{renderContent()}</div>
      <BottomTabBar
        currentTab={activeSubScreen ? "" : currentTab}
        onSelectTab={(tab) => {
          setActiveSubScreen(null);
          setCurrentTab(tab);
        }}
        unreadCount={3}
      />
    </ScreenWrapper>
  );
};
