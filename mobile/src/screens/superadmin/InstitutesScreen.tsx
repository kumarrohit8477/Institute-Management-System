import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Badge, SearchBar } from "../../components/Header";
import { EmptyState } from "../../components/shared/EmptyState";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileSuperAdminService } from "../../services/superAdminService";

export const InstitutesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await MobileSuperAdminService.getInstitutes({ search });
        const list = Array.isArray(res) ? res : res?.institutes || res?.data || [];
        setInstitutes(list);
      } catch (err) {
        console.warn("Failed fetching institutes:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Tenants & Institutes" subtitle="Multi-Tenant SaaS Directory" onBack={onBack} accentColor={Colors.superadmin.primary} />
      
      <View style={{ paddingHorizontal: Spacing.base, paddingTop: Spacing.base }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search institutes by name or code..." />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.superadmin.primary} />
        </View>
      ) : institutes.length === 0 ? (
        <EmptyState icon="🏫" title="No Institutes Found" subtitle="No registered institute tenants found." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {institutes.map((inst) => (
            <Card key={inst.id} style={styles.instCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.instName}>{inst.name}</Text>
                  <Text style={styles.instCode}>Code: {inst.code}</Text>
                </View>
                <Badge
                  label={inst.status || "ACTIVE"}
                  variant={inst.status === "ACTIVE" ? "success" : inst.status === "TRIAL" ? "warning" : "danger"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <Text style={styles.infoText}>✉️ {inst.email || "N/A"}</Text>
                <Text style={styles.infoText}>📞 {inst.phone || "N/A"}</Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  instCard: {
    marginBottom: Spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  instName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  instCode: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
