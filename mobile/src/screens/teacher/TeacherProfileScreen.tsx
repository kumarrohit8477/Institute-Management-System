import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Button } from "../../components/Header";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { useAuth } from "../../hooks/useAuth";
import { MobileAuthService } from "../../services/authService";
import { Input } from "../../components/shared/Input";
import { FormModal } from "../../components/shared/FormModal";

export const TeacherProfileScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user, teacher, institute } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [changing, setChanging] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      Alert.alert("Validation Error", "Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      Alert.alert("Validation Error", "New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(passwordForm.newPassword) || !/[a-z]/.test(passwordForm.newPassword) || !/[0-9]/.test(passwordForm.newPassword)) {
      Alert.alert("Validation Error", "New password must contain uppercase, lowercase, and a number.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Validation Error", "New password and confirm password do not match.");
      return;
    }

    setChanging(true);
    try {
      await MobileAuthService.changePassword(passwordForm);
      Alert.alert("Success", "Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setModalOpen(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update password. Check your current password.");
    } finally {
      setChanging(false);
    }
  };

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

        {/* Account Security Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Text style={{ fontSize: 12, color: Colors.textMuted, marginBottom: 8 }}>
            Manage your faculty account security and credentials.
          </Text>
          <Button
            title="🔑 Reset / Change Password"
            variant="outline"
            onPress={() => setModalOpen(true)}
          />
        </Card>

        {/* Logout Button */}
        <Button title="Logout" variant="danger" onPress={onLogout} style={{ marginTop: Spacing.md }} />
      </ScrollView>

      {/* Reset Password Modal */}
      <FormModal
        visible={modalOpen}
        title="Reset Account Password"
        onClose={() => setModalOpen(false)}
        onSubmit={handleChangePassword}
        loading={changing}
        submitText="Update Password"
      >
        <Input
          label="Current Password"
          placeholder="Enter current password"
          secureTextEntry
          value={passwordForm.currentPassword}
          onChangeText={(v) => setPasswordForm({ ...passwordForm, currentPassword: v })}
          required
        />
        <Input
          label="New Password"
          placeholder="Min 8 chars (A-Z, a-z, 0-9)"
          secureTextEntry
          value={passwordForm.newPassword}
          onChangeText={(v) => setPasswordForm({ ...passwordForm, newPassword: v })}
          required
        />
        <Input
          label="Confirm New Password"
          placeholder="Re-enter new password"
          secureTextEntry
          value={passwordForm.confirmPassword}
          onChangeText={(v) => setPasswordForm({ ...passwordForm, confirmPassword: v })}
          required
        />
      </FormModal>
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
