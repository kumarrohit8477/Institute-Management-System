import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";
import { BottomTabBar } from "../components/Header";
import { useAuth } from "../hooks/useAuth";

// Super Admin Screens
import { SuperAdminDashboardScreen } from "../screens/superadmin/SuperAdminDashboardScreen";
import { InstitutesScreen } from "../screens/superadmin/InstitutesScreen";
import { SubscriptionPlansScreen } from "../screens/superadmin/SubscriptionPlansScreen";
import { PlatformBillingScreen } from "../screens/superadmin/PlatformBillingScreen";
import { SuperAdminProfileScreen } from "../screens/superadmin/SuperAdminProfileScreen";

type SuperAdminTab = "dashboard" | "institutes" | "plans" | "billing" | "profile";

const SUPERADMIN_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "institutes", label: "Institutes", icon: "🏫" },
  { id: "plans", label: "Plans", icon: "💎" },
  { id: "billing", label: "Billing", icon: "💰" },
  { id: "profile", label: "Profile", icon: "👑" },
];

export const SuperAdminNavigator: React.FC = () => {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<SuperAdminTab>("dashboard");
  const [subScreen, setSubScreen] = useState<string | null>(null);
  const [screenParams, setScreenParams] = useState<any>({});

  const navigateTo = (screen: string, params?: any) => {
    setScreenParams(params || {});
    setSubScreen(screen);
  };

  const goBack = () => {
    setSubScreen(null);
    setScreenParams({});
  };

  const renderScreen = () => {
    switch (currentTab) {
      case "dashboard":
        return <SuperAdminDashboardScreen onNavigate={navigateTo} />;
      case "institutes":
        return <InstitutesScreen onBack={() => setCurrentTab("dashboard")} />;
      case "plans":
        return <SubscriptionPlansScreen onBack={() => setCurrentTab("dashboard")} />;
      case "billing":
        return <PlatformBillingScreen onBack={() => setCurrentTab("dashboard")} />;
      case "profile":
        return <SuperAdminProfileScreen onLogout={logout} />;
      default:
        return <SuperAdminDashboardScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>{renderScreen()}</View>
      <BottomTabBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSubScreen(null);
          setCurrentTab(tab as SuperAdminTab);
        }}
        tabs={SUPERADMIN_TABS}
        accentColor={Colors.superadmin.primary}
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
