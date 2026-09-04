import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Button } from "../../components/Header";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { useAuth } from "../../hooks/useAuth";

export const TeacherProfileScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user, teacher, institute } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="My Profile" subtitle="Faculty Portal" accentColor={Colors.teacher.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👨‍🏫</Text>
          </View>
          <Text style={styles.nameText}>
            {teacher ? `${teacher.firstName} ${teacher.lastName}` : user?.name || "Teacher Faculty"}
          </Text>
          <Text style={styles.roleTag}>Employee Code: {teacher?.employeeCode || "EMP-001"}</Text>
          <Text style={styles.instituteTag}>🏫 {institute?.name || "Apex Academy"}</Text>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{teacher?.email || user?.email || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{teacher?.phone || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Qualification</Text>
            <Text style={styles.infoValue}>{teacher?.qualification || "M.Sc. Physics"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Specialization</Text>
            <Text style={styles.infoValue}>{teacher?.specialization || "Physics / Mechanics"}</Text>
          </View>
        </Card>

        {/* Logout Button */}
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
    backgroundColor: Colors.teacher.light,
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
    color: Colors.teacher.primary,
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
