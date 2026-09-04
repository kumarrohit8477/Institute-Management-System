import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { getApiBaseUrl, setCustomApiBaseUrl } from "../../services/api";

const DEMO_ACCOUNTS = {
  student: {
    label: "👨‍🎓 Student",
    email: "student@institute.local",
    password: "StudentSecurePassword123!",
    code: "INST001",
    color: Colors.student.primary,
    bg: Colors.student.light,
    darkColor: Colors.student.dark,
  },
  teacher: {
    label: "👨‍🏫 Teacher",
    email: "amit.sharma@apexacademy.local",
    password: "Teacher@123",
    code: "INST001",
    color: Colors.teacher.primary,
    bg: Colors.teacher.light,
    darkColor: Colors.teacher.dark,
  },
  admin: {
    label: "🛡️ Admin",
    email: "admin@institute.local",
    password: "AdminSecurePassword123!",
    code: "INST001",
    color: Colors.admin.primary,
    bg: Colors.admin.light,
    darkColor: Colors.admin.dark,
  },
  superadmin: {
    label: "👑 Super Admin",
    email: "superadmin@ims.local",
    password: "SuperAdminSecure2026!",
    code: "",
    color: Colors.superadmin.primary,
    bg: Colors.superadmin.light,
    darkColor: Colors.superadmin.dark,
  },
};

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState(DEMO_ACCOUNTS.student.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.student.password);
  const [instituteCode, setInstituteCode] = useState(DEMO_ACCOUNTS.student.code);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Settings Modal state
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    getApiBaseUrl().then((url) => setServerUrl(url));
  }, []);

  const fillDemo = (roleKey: keyof typeof DEMO_ACCOUNTS) => {
    const acc = DEMO_ACCOUNTS[roleKey];
    setIdentifier(acc.email);
    setPassword(acc.password);
    setInstituteCode(acc.code);
    setError(null);
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your email/ID and password.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login({
        email: identifier.trim(),
        password,
        instituteCode: instituteCode.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setCustomApiBaseUrl(serverUrl.trim() || null);
      setShowSettings(false);
      Alert.alert("Server URL Saved", `API Base URL updated to:\n${serverUrl}`);
    } catch {
      Alert.alert("Error", "Failed to update server URL");
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const target = serverUrl.trim();
      const testEndpoint = `${target}/health`;
      const res = await fetch(testEndpoint);
      if (res.ok) {
        Alert.alert("Connection Successful! ✅", `Successfully connected to server at:\n${target}`);
      } else {
        Alert.alert("Connection Failed ❌", `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      Alert.alert("Connection Failed ❌", `Could not reach server at ${serverUrl}.\nCheck IP and make sure backend server is running.`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background gradient circles */}
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />

          {/* Top Bar with Settings Gear */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.gearButton}
              onPress={() => setShowSettings(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.gearIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Logo area */}
          <View style={styles.logoArea}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.appName}>IMS Portal</Text>
            <Text style={styles.appTagline}>Institute Management System</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to access your portal — Students, Teachers, Admins &amp; Super Admins
            </Text>

            {/* Quick Fill Demo Chips */}
            <View style={styles.quickFillContainer}>
              <Text style={styles.quickFillHeader}>Quick Fill Demo Credentials:</Text>
              <View style={styles.roleHints}>
                {(Object.keys(DEMO_ACCOUNTS) as Array<keyof typeof DEMO_ACCOUNTS>).map((key) => {
                  const acc = DEMO_ACCOUNTS[key];
                  const isSelected = identifier === acc.email;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => fillDemo(key)}
                      activeOpacity={0.75}
                      style={[
                        styles.roleChip,
                        { backgroundColor: acc.bg },
                        isSelected && { borderWidth: 1.5, borderColor: acc.color },
                      ]}
                    >
                      <Text style={[styles.roleChipText, { color: acc.darkColor }]}>
                        {acc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Institute Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>INSTITUTE CODE</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🏫</Text>
                <TextInput
                  style={styles.input}
                  value={instituteCode}
                  onChangeText={setInstituteCode}
                  placeholder="e.g. INST001 (optional for Super Admin)"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS / STUDENT ID</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Need assistance? Contact your institute administration
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Settings Gear Modal */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ Server Settings</Text>
            <Text style={styles.modalSubtitle}>Configure Backend API Server URL</Text>

            <Text style={styles.label}>BACKEND API BASE URL</Text>
            <TextInput
              style={styles.modalInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://192.168.1.x:5000/api/v1"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.testBtn]}
                onPress={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>Test Link</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveSettings}
              >
                <Text style={styles.modalBtnText}>Save URL</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  topBar: {
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  gearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  gearIcon: {
    fontSize: 22,
  },
  bgCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.15,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.student.primary,
    opacity: 0.1,
    bottom: 40,
    left: -60,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 32,
  },
  appName: {
    ...Typography.h1,
    color: Colors.textOnDark,
    marginBottom: 2,
  },
  appTagline: {
    ...Typography.bodySmall,
    color: Colors.textOnDark,
    opacity: 0.7,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius["2xl"],
    padding: Spacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  quickFillContainer: {
    marginBottom: Spacing.base,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  quickFillHeader: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  roleHints: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    gap: 8,
  },
  errorIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    ...Typography.caption,
    color: Colors.dangerDark,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.sm : 0,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.base,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 48,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    ...Typography.buttonLarge,
    color: Colors.textOnDark,
  },
  footer: {
    ...Typography.caption,
    color: Colors.textOnDark,
    opacity: 0.6,
    textAlign: "center",
    marginTop: Spacing.md,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  testBtn: {
    backgroundColor: Colors.info,
  },
  saveBtn: {
    backgroundColor: Colors.success,
  },
  modalBtnText: {
    ...Typography.button,
    color: "#fff",
  },
  closeBtn: {
    marginTop: Spacing.xs,
    paddingVertical: 8,
    alignItems: "center",
  },
  closeBtnText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
});
