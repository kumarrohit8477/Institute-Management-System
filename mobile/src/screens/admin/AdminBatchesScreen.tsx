import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Badge, SearchBar } from "../../components/Header";
import { EmptyState } from "../../components/shared/EmptyState";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileAdminService } from "../../services/adminService";

export const AdminBatchesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await MobileAdminService.getBatches({ search });
        const list = Array.isArray(res) ? res : res?.batches || res?.data || [];
        setBatches(list);
      } catch (err) {
        console.warn("Failed fetching batches:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Batches Management" subtitle="Academic Batches" onBack={onBack} accentColor={Colors.admin.primary} />
      <View style={{ paddingHorizontal: Spacing.base, paddingTop: Spacing.base }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search batches by name or code..." />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.admin.primary} />
        </View>
      ) : batches.length === 0 ? (
        <EmptyState icon="📦" title="No Batches Found" subtitle="No academic batches match your query." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {batches.map((item) => (
            <Card key={item.id} style={styles.batchCard}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.batchName}>{item.name}</Text>
                  <Text style={styles.courseName}>{item.course?.name || "Course"}</Text>
                </View>
                <Badge
                  label={item.status || "ACTIVE"}
                  variant={item.status === "ACTIVE" ? "success" : item.status === "UPCOMING" ? "warning" : "gray"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Code: {item.code}</Text>
                <Text style={styles.infoText}>
                  Strength: {item._count?.students ?? item.studentsCount ?? 0} / {item.maxStrength || 60}
                </Text>
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
  batchCard: {
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  batchName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  courseName: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
