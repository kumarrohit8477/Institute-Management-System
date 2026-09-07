import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { Colors } from "../src/theme/colors";
import { Typography } from "../src/theme/typography";

export default function IndexScreen() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    switch (role) {
      case "SUPER_ADMIN":
        router.replace("/(superadmin)/dashboard");
        break;
      case "ADMIN":
        router.replace("/(admin)/dashboard");
        break;
      case "TEACHER":
        router.replace("/(teacher)/dashboard");
        break;
      case "STUDENT":
        router.replace("/(student)/dashboard");
        break;
      default:
        router.replace("/login");
        break;
    }
  }, [isAuthenticated, isLoading, role, router]);

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
