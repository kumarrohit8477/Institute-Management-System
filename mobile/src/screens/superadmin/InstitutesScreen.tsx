import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/Header";
import { Input } from "../../components/shared/Input";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { EmptyState } from "../../components/shared/EmptyState";
import { LoadingScreen } from "../../components/shared/LoadingScreen";
import { FormModal } from "../../components/shared/FormModal";
import { SelectPicker } from "../../components/shared/SelectPicker";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileSuperAdminService, InstituteTenantItem } from "../../services/superAdminService";

export const InstitutesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [institutes, setInstitutes] = useState<InstituteTenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    adminEmail: "",
    adminPassword: "",
    planTier: "STARTER",
  });

  const loadInstitutes = async () => {
    try {
      const res = await MobileSuperAdminService.getInstitutes({
        search: search.trim() || undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      });
      setInstitutes(res.institutes || []);
    } catch (err) {
      console.warn("Failed loading institutes:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInstitutes();
  }, [selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInstitutes();
  };

  const handleToggleStatus = async (inst: InstituteTenantItem) => {
    const nextStatus = inst.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await MobileSuperAdminService.updateInstituteStatus(inst.id, nextStatus);
      Alert.alert("Status Updated", `Institute status changed to ${nextStatus}`);
      loadInstitutes();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed updating status");
    }
  };

  const handleOnboard = async () => {
    if (!form.name || !form.code || !form.email || !form.adminEmail || !form.adminPassword) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await MobileSuperAdminService.onboardInstitute(form);
      Alert.alert("Success", "Institute onboarded successfully!");
      setModalVisible(false);
      setForm({ name: "", code: "", email: "", phone: "", adminEmail: "", adminPassword: "", planTier: "STARTER" });
      loadInstitutes();
    } catch (err: any) {
      Alert.alert("Onboarding Failed", err.message || "Failed to onboard institute");
    } finally {
      setSubmitting(false);
    }
  };

  const STATUS_TABS = ["ALL", "ACTIVE", "SUSPENDED", "TRIAL"];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader title="Institutes & Tenants" onBack={onBack} />

      {/* Top Bar with Add Button */}
      <View style={styles.topSection}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search institute name or code..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadInstitutes}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Onboard</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {STATUS_TABS.map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.tab, selectedStatus === st && styles.tabActive]}
            onPress={() => setSelectedStatus(st)}
          >
            <Text style={[styles.tabText, selectedStatus === st && styles.tabTextActive]}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingScreen message="Fetching tenant accounts..." />
      ) : (
        <FlatList
          data={institutes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.superadmin.primary]} />}
          ListEmptyComponent={
            <EmptyState icon="🏫" title="No Institutes Found" message="No tenant institutes match your search criteria." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.instName}>{item.name}</Text>
                  <Text style={styles.instCode}>Code: {item.code} • {item.email}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailPill}>
                  <Text style={styles.detailLabel}>Plan</Text>
                  <Text style={styles.detailVal}>{item.subscription?.plan?.name || "Standard"}</Text>
                </View>
                <View style={styles.detailPill}>
                  <Text style={styles.detailLabel}>Students</Text>
                  <Text style={styles.detailVal}>{item._count?.students ?? item.tenantUsage?.studentCount ?? 0}</Text>
                </View>
                <View style={styles.detailPill}>
                  <Text style={styles.detailLabel}>Batches</Text>
                  <Text style={styles.detailVal}>{item._count?.batches ?? item.tenantUsage?.batchCount ?? 0}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, item.status === "ACTIVE" ? styles.actionBtnDanger : styles.actionBtnSuccess]}
                  onPress={() => handleToggleStatus(item)}
                >
                  <Text style={styles.actionBtnText}>{item.status === "ACTIVE" ? "Suspend" : "Activate"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Onboard Institute Form Modal */}
      <FormModal
        visible={modalVisible}
        title="Onboard New Institute"
        onClose={() => setModalVisible(false)}
        onSubmit={handleOnboard}
        loading={submitting}
        submitText="Create Tenant"
      >
        <Input
          label="Institute Name"
          placeholder="e.g. Apex Academy"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          required
        />
        <Input
          label="Institute Code / Slug"
          placeholder="e.g. APEX"
          value={form.code}
          onChangeText={(v) => setForm({ ...form, code: v.toUpperCase() })}
          required
        />
        <Input
          label="Contact Email"
          placeholder="e.g. contact@apex.com"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          required
        />
        <Input
          label="Contact Phone"
          placeholder="e.g. +91 9876543210"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => setForm({ ...form, phone: v })}
        />
        <Input
          label="Admin Account Email"
          placeholder="e.g. admin@apex.com"
          keyboardType="email-address"
          value={form.adminEmail}
          onChangeText={(v) => setForm({ ...form, adminEmail: v })}
          required
        />
        <Input
          label="Admin Initial Password"
          placeholder="Password for initial login"
          secureTextEntry
          value={form.adminPassword}
          onChangeText={(v) => setForm({ ...form, adminPassword: v })}
          required
        />
        <SelectPicker
          label="Select Subscription Tier"
          options={[
            { label: "Starter Tier", value: "STARTER" },
            { label: "Growth Tier", value: "GROWTH" },
            { label: "Enterprise Tier", value: "ENTERPRISE" },
          ]}
          selectedValue={form.planTier}
          onSelect={(v) => setForm({ ...form, planTier: v })}
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
  topSection: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: Colors.superadmin.primary,
    paddingHorizontal: Spacing.base,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    ...Typography.button,
    color: Colors.surface,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  tabActive: {
    backgroundColor: Colors.superadmin.primary,
  },
  tabText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.surface,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  instName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  instCode: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  detailPill: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  detailVal: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  actionBtnDanger: {
    backgroundColor: "#FEE2E2",
  },
  actionBtnSuccess: {
    backgroundColor: "#DCFCE7",
  },
  actionBtnText: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});
