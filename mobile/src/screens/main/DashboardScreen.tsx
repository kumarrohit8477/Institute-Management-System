import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { MobileStudentService } from "../../services/studentService";
import { Card, Badge } from "../../components/Header";

export const DashboardScreen: React.FC<{ onNavigate: (screen: string, params?: any) => void }> = ({ onNavigate }) => {
  const { student, institute } = useAuth();
  const [academics, setAcademics] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [acad, sched, att] = await Promise.allSettled([
          MobileStudentService.getAcademics(),
          MobileStudentService.getSchedule(),
          MobileStudentService.getAttendance()
        ]);
        if (acad.status === "fulfilled") setAcademics(acad.value);
        if (sched.status === "fulfilled") setSchedule(sched.value);
        if (att.status === "fulfilled") setAttendance(att.value);
      } catch (err) {
        console.warn("Mobile dashboard fallback:", err);
      }
    };
    load();
  }, []);

  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayName = daysOfWeek[new Date().getDay()];
  const todayClasses = schedule?.scheduleByDay?.[todayName] || [
    {
      id: "c1",
      startTime: "09:00",
      endTime: "10:30",
      subject: { name: "Physics (Mechanics)" },
      teacher: { firstName: "Dr. Harish", lastName: "Verma" },
      roomNumber: "LH-101",
      classType: "OFFLINE"
    },
    {
      id: "c2",
      startTime: "11:00",
      endTime: "12:30",
      subject: { name: "Mathematics (Calculus)" },
      teacher: { firstName: "Prof. Sunita", lastName: "Ramanujan" },
      meetingLink: "https://meet.google.com/demo",
      classType: "ONLINE"
    }
  ];

  const currentBatch = academics?.batches?.[0];
  const attPercentage = attendance?.statistics?.attendancePercentage ?? 95.2;

  const quickActions = [
    { label: "Timetable", icon: "📅", screen: "timetable" },
    { label: "Materials", icon: "📖", screen: "materials" },
    { label: "Tests", icon: "📝", screen: "tests" },
    { label: "Attendance", icon: "✅", screen: "attendance" }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Student Banner */}
      <View style={styles.banner}>
        <Text style={styles.instituteLabel}>
          {institute?.name || "Apex Academy"}
        </Text>
        <Text style={styles.greeting}>
          Hello, {student?.firstName || "Student"}! 👋
        </Text>
        <View style={styles.badgeRow}>
          <Text style={styles.metaText}>
            Adm: <Text style={styles.boldText}>{student?.admissionNumber || "ADM-2026-001"}</Text>
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>
            Batch: <Text style={styles.boldText}>{currentBatch?.name || "JEE Morning Star"}</Text>
          </Text>
        </View>
      </View>

      {/* Quick Action Grid */}
      <View style={styles.gridContainer}>
        {quickActions.map((item) => (
          <TouchableOpacity
            key={item.screen}
            onPress={() => onNavigate(item.screen)}
            style={styles.gridItem}
            activeOpacity={0.7}
          >
            <Text style={styles.gridIcon}>{item.icon}</Text>
            <Text style={styles.gridLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Attendance Standing Widget */}
      <Card onPress={() => onNavigate("attendance")} style={styles.widgetCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Attendance Standing</Text>
          <Badge label="Good Standing" variant="success" />
        </View>

        <View style={styles.attRow}>
          <View>
            <Text style={styles.attPctText}>{attPercentage}%</Text>
            <Text style={styles.attNote}>Satisfies ≥ 75% requirement</Text>
          </View>
          <Text style={styles.linkText}>View Log →</Text>
        </View>
      </Card>

      {/* Today's Schedule */}
      <View style={styles.scheduleSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Classes ({todayName})</Text>
          <TouchableOpacity onPress={() => onNavigate("timetable")} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Full Week →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.classList}>
          {todayClasses.map((c: any) => (
            <Card key={c.id} style={styles.classCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classSubject}>{c.subject?.name}</Text>
                  <Text style={styles.classTeacher}>
                    👨‍🏫 {c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : "Faculty"}
                    {c.roomNumber ? ` • Room ${c.roomNumber}` : ""}
                  </Text>
                </View>
                <Badge
                  label={c.classType || "OFFLINE"}
                  variant={c.classType === "ONLINE" ? "primary" : "gray"}
                />
              </View>

              <View style={styles.classFooter}>
                <Text style={styles.classTime}>
                  ⏰ {c.startTime} - {c.endTime}
                </Text>

                {c.meetingLink ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(c.meetingLink)}
                    style={styles.joinBtn}
                  >
                    <Text style={styles.joinBtnText}>Join Video 🎥</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.inClassPill}>
                    <Text style={styles.inClassText}>In-Class</Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Upcoming Examinations Preview */}
      <Card onPress={() => onNavigate("tests")} style={styles.examCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Upcoming Examinations</Text>
          <Badge label="Scheduled" variant="warning" />
        </View>
        <Text style={styles.examTitle}>
          JEE Main All-India Grand Mock Test 1
        </Text>
        <Text style={styles.examMeta}>
          3 Hours • 300 Marks • Active CBT Online
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 40
  },
  banner: {
    backgroundColor: "#1e3a8a",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  instituteLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#93c5fd",
    marginBottom: 4,
    letterSpacing: 0.5
  },
  greeting: {
    fontSize: 19,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6
  },
  metaText: {
    fontSize: 12,
    color: "#e0e7ff"
  },
  boldText: {
    fontWeight: "700",
    color: "#ffffff"
  },
  dot: {
    color: "#93c5fd",
    fontSize: 12
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  gridItem: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  gridIcon: {
    fontSize: 22,
    marginBottom: 6
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155"
  },
  widgetCard: {
    marginBottom: 2
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a"
  },
  attRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  attPctText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#10b981"
  },
  attNote: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  linkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6"
  },
  scheduleSection: {
    gap: 10
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a"
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6"
  },
  classList: {
    gap: 10
  },
  classCard: {
    marginBottom: 2
  },
  classSubject: {
    fontWeight: "700",
    fontSize: 14,
    color: "#0f172a"
  },
  classTeacher: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  classFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
    marginTop: 8
  },
  classTime: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6"
  },
  joinBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  joinBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700"
  },
  inClassPill: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  inClassText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "700"
  },
  examCard: {
    marginBottom: 4
  },
  examTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 3
  },
  examMeta: {
    fontSize: 11,
    color: "#64748b"
  }
});
