import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Badge } from "../../components/Header";
import { EmptyState } from "../../components/shared/EmptyState";
import { Colors } from "../../theme/colors";
import { Typography, Spacing, Radius } from "../../theme/typography";
import { MobileTeacherService } from "../../services/teacherService";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export const TeacherTimetableScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await MobileTeacherService.getTimetable();
        setSchedule(res?.scheduleByDay || {});
      } catch (err) {
        console.warn("Failed loading teacher timetable:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const daySchedule = schedule?.[selectedDay] || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="My Class Schedule" subtitle="Weekly Timetable" onBack={onBack} accentColor={Colors.teacher.primary} />
      
      {/* Day Selector */}
      <View style={styles.daysWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
          {DAYS.map((day) => {
            const active = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[styles.dayChip, active && styles.dayChipActive]}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.teacher.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {daySchedule.length === 0 ? (
            <EmptyState icon="📅" title="No Classes Scheduled" subtitle={`You have no lectures assigned for ${selectedDay}.`} />
          ) : (
            daySchedule.map((item: any, idx: number) => (
              <Card key={item.id || idx} style={styles.classCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{item.subject?.name || "Subject"}</Text>
                    <Text style={styles.batchName}>Batch: {item.batch?.name || "Batch"}</Text>
                  </View>
                  <Badge
                    label={item.classType || "OFFLINE"}
                    variant={item.classType === "ONLINE" ? "primary" : "gray"}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <Text style={styles.timeText}>
                    ⏰ {item.startTime || "09:00"} - {item.endTime || "10:00"}
                  </Text>
                  {item.roomNumber && (
                    <Text style={styles.roomText}>🏫 Room: {item.roomNumber}</Text>
                  )}
                </View>
              </Card>
            ))
          )}
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
  daysWrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  daysContainer: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
  },
  dayChipActive: {
    backgroundColor: Colors.teacher.primary,
  },
  dayText: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  dayTextActive: {
    color: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  classCard: {
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  subjectName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  batchName: {
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
  timeText: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.teacher.primary,
  },
  roomText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
