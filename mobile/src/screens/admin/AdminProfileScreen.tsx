import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Button } from "../../components/Header";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { useAuth } from "../../hooks/useAuth";

export const AdminProfileScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user, institute } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Institute Profile" subtitle="Admin Portal" accentColor={Colors.admin.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🛡️</Text>
          </View>
          <Text style={styles.nameText}>{user?.name || "Institute Admin"}</Text>
          <Text style={styles.roleTag}>Role: Administrator</Text>
          <Text style={styles.instituteTag}>🏫 {institute?.name || "Institute Management System"}</Text>
        </Card>

        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Institute Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Institute Code</Text>
            <Text style={styles.infoValue}>{institute?.code || "INST001"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Admin Email</Text>
            <Text style={styles.infoValue}>{user?.email || "admin@institute.local"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{institute?.status || "ACTIVE"}</Text>
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
    backgroundColor: Colors.admin.light,
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
    color: Colors.admin.primary,
    marginTop: 2,
  },
  instituteTag: {
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
