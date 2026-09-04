import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";

// Auth
import { LoginScreen } from "../screens/auth/LoginScreen";

// Student
import { StudentNavigator } from "./StudentNavigator";

// Teacher
import { TeacherNavigator } from "./TeacherNavigator";

// Admin
import { AdminNavigator } from "./AdminNavigator";

// Super Admin
import { SuperAdminNavigator } from "./SuperAdminNavigator";

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>IMS Portal</Text>
          <Text style={styles.loadingSubtext}>Loading your workspace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Route based on user role
  switch (role) {
    case "STUDENT":
      return <StudentNavigator />;
    case "TEACHER":
      return <TeacherNavigator />;
    case "ADMIN":
      return <AdminNavigator />;
    case "SUPER_ADMIN":
      return <SuperAdminNavigator />;
    default:
      return <LoginScreen />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  loadingText: {
    ...Typography.h2,
    color: Colors.textOnDark,
    marginTop: 8,
  },
  loadingSubtext: {
    ...Typography.caption,
    color: Colors.textOnDark,
    opacity: 0.6,
  },
});
