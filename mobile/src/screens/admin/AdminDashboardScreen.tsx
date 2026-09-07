import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoleBanner, SectionHeader } from "../../components/Header";
import { StatCard } from "../../components/shared/StatCard";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileAdminService } from "../../services/adminService";

export const AdminDashboardScreen: React.FC<{ onNavigate: (screen: string, params?: any) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await MobileAdminService.getDashboardStats();
      setStats(res);
    } catch (err) {
      console.warn("Failed loading admin stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.admin.primary]} />}
      >
        <RoleBanner role="admin" title="Institute Administration" subtitle="Campus Management & Academic Operations" />

        {loading ? (
          <ActivityIndicator size="large" color={Colors.admin.primary} style={{ marginVertical: Spacing.xl }} />
        ) : (
          <>
            <SectionHeader title="Institute Key Metrics" />
            <View style={styles.statsGrid}>
              <StatCard
                icon="👨‍🎓"
                label="Enrolled Students"
                value={stats?.students ?? 0}
                color={Colors.admin.primary}
                lightColor={Colors.admin.light}
              />
              <StatCard
                icon="👨‍🏫"
                label="Active Teachers"
                value={stats?.teachers ?? 0}
                color={Colors.info}
                lightColor={Colors.infoLight}
              />
            </View>

            <View style={[styles.statsGrid, { marginTop: Spacing.sm }]}>
              <StatCard
                icon="📚"
                label="Active Courses"
                value={stats?.courses ?? 0}
                color={Colors.success}
                lightColor={Colors.successLight}
              />
              <StatCard
                icon="👥"
                label="Running Batches"
                value={stats?.batches ?? 0}
                color={Colors.warning}
                lightColor={Colors.warningLight}
              />
            </View>

            <SectionHeader title="Quick Academic Actions" />
            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("students")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>👨‍🎓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Students Directory</Text>
                  <Text style={styles.quickSubtitle}>Add, edit & assign student batches</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("teachers")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>👨‍🏫</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Faculty & Teachers</Text>
                  <Text style={styles.quickSubtitle}>Manage teachers & subject assignments</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("courses")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>📚</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Courses Catalog</Text>
                  <Text style={styles.quickSubtitle}>Define degree & diploma programs</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("subjects")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>📖</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Academic Subjects</Text>
                  <Text style={styles.quickSubtitle}>Subject definitions & department tags</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("batches")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>👥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Student Batches</Text>
                  <Text style={styles.quickSubtitle}>Batch schedules & faculty assignments</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("rooms")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>🏛️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Classrooms & Labs</Text>
                  <Text style={styles.quickSubtitle}>Campus room capacity & types</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("timetable")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>📅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Timetable Master</Text>
                  <Text style={styles.quickSubtitle}>Schedule weekly class slots</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate("materials")} activeOpacity={0.75}>
                <Text style={styles.quickIcon}>📁</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTitle}>Study Materials</Text>
                  <Text style={styles.quickSubtitle}>Upload PDFs & lecture notes</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  quickGrid: {
    gap: Spacing.sm,
  },
  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  quickIcon: {
    fontSize: 28,
  },
  quickTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  quickSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: Colors.admin.primary,
    fontWeight: "bold",
  },
});
