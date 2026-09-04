import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Button } from "../../components/Header";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { useAuth } from "../../hooks/useAuth";

export const SuperAdminProfileScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Super Admin Profile" subtitle="Platform Owner" accentColor={Colors.superadmin.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👑</Text>
          </View>
          <Text style={styles.nameText}>{user?.name || "Super Administrator"}</Text>
          <Text style={styles.roleTag}>Global SaaS Platform Owner</Text>
          <Text style={styles.emailText}>{user?.email || "superadmin@institute.local"}</Text>
        </Card>

        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>System Privileges</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Multi-Tenant Access</Text>
            <Text style={styles.infoValue}>Full (All Institutes)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Billing Control</Text>
            <Text style={styles.infoValue}>Enabled</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan Management</Text>
            <Text style={styles.infoValue}>Enabled</Text>
          </View>
        </Card>

        <Button title="Logout" variant="danger" onPress={onLogout} style={{ marginTop: Spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.superadmin.light,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  nameText: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  roleTag: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.superadmin.primary,
    marginTop: 2,
  },
  emailText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 4,
  },
  detailsCard: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.sm,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  infoValue: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
});
