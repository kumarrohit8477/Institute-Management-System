import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MobileStudentService } from "../../services/studentService";
import { Header, Card, Badge } from "../../components/Header";

export const CoursesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [academics, setAcademics] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getAcademics().then(setAcademics).catch(console.warn);
  }, []);

  const courses = academics?.courses || [
    {
      id: "1",
      name: "IIT-JEE 2-Year Advanced Program",
      code: "JEE-2027",
      description: "Intensive 2-year preparation for JEE Main & Advanced comprehensive curriculum.",
      durationMonths: 24
    }
  ];

  return (
    <View style={styles.container}>
      <Header title="My Courses" subtitle="Enrolled academic programs" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {courses.map((c: any) => (
          <Card key={c.id} style={styles.courseCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.courseName}>{c.name}</Text>
              <Badge label={c.code} variant="primary" />
            </View>

            <Text style={styles.courseDesc}>{c.description}</Text>

            <View style={styles.footerRow}>
              <Text style={styles.durationText}>
                ⏳ Duration: {c.durationMonths || 24} Months
              </Text>
              <Badge label="Active" variant="success" />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  scrollList: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },
  courseCard: {
    marginBottom: 4
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8
  },
  courseName: {
    flex: 1,
    fontWeight: "800",
    fontSize: 15,
    color: "#0f172a",
    marginRight: 8
  },
  courseDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 12
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10
  },
  durationText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "700"
  }
});
