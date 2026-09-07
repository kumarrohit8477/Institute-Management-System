import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoleBanner } from "../../components/Header";
import { FormModal } from "../../components/shared/FormModal";
import { Input } from "../../components/shared/Input";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { useAuth } from "../../hooks/useAuth";
import { getApiBaseUrl, setCustomApiBaseUrl } from "../../services/api";

export const SuperAdminProfileScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [customIp, setCustomIp] = useState("");

  useEffect(() => {
    getApiBaseUrl().then(setCurrentUrl);
  }, []);

  const handleSaveIp = async () => {
    const trimmed = customIp.trim();
    if (!trimmed) {
      await setCustomApiBaseUrl(null);
    } else {
      let formatted = trimmed;
      if (!formatted.startsWith("http")) {
        formatted = `http://${formatted}`;
      }
      if (!formatted.endsWith("/api/v1")) {
        formatted = formatted.endsWith("/") ? `${formatted}api/v1` : `${formatted}/api/v1`;
      }
      await setCustomApiBaseUrl(formatted);
    }
    const newUrl = await getApiBaseUrl();
    setCurrentUrl(newUrl);
    setModalVisible(false);
    Alert.alert("API Endpoint Saved", `Current Base URL:\n${newUrl}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <RoleBanner role="superadmin" title="Super Admin Account" subtitle="Platform Management Credentials" />

        <View style={styles.profileCard}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>👑</Text>
          </View>
          <Text style={styles.userName}>{user?.name || user?.email || "Platform Super Admin"}</Text>
          <Text style={styles.userRole}>ROLE: SUPER_ADMIN</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>System Connection</Text>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>API Base URL:</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{currentUrl}</Text>
          </View>
          <TouchableOpacity style={styles.ipBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.ipBtnText}>⚙️ Configure Custom Backend IP</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <FormModal
        visible={modalVisible}
        title="Configure Backend IP"
        onClose={() => setModalVisible(false)}
        onSubmit={handleSaveIp}
        submitText="Save IP"
      >
        <Text style={styles.modalSub}>
          Enter local IP address of backend (e.g. 192.168.1.100:5000 or http://192.168.1.100:5000/api/v1). Leave empty to use auto-detected LAN IP.
        </Text>
        <Input
          label="Backend IP / URL"
          placeholder="e.g. 192.168.1.5:5000"
          value={customIp}
          onChangeText={setCustomIp}
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  avatarBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.superadmin.light,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  avatarText: {
    fontSize: 36,
  },
  userName: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  userRole: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.superadmin.primary,
    backgroundColor: Colors.superadmin.light,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  userEmail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  rowItem: {
    gap: 4,
  },
  rowLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  rowValue: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  ipBtn: {
    backgroundColor: Colors.surfaceVariant,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ipBtnText: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  logoutBtn: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.surface,
  },
  modalSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
});
