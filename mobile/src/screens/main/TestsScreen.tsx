import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { MobileExamService, AvailableTestItem } from "../../services/examService";
import { Header, Card, Badge, Button } from "../../components/Header";

export const TestsScreen: React.FC<{
  onNavigate: (screen: string, params?: any) => void;
  onBack?: () => void;
}> = ({ onNavigate, onBack }) => {
  const [tests, setTests] = useState<AvailableTestItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");

  useEffect(() => {
    MobileExamService.getTests().then((res) => {
      setTests(Array.isArray(res) ? res : []);
    }).catch(console.warn);
  }, []);

  const fallbackTests: any[] = [
    {
      id: "test-jee-01",
      title: "JEE Main All-India Grand Mock Test 1",
      durationMinutes: 180,
      totalMarks: 300,
      passingMarks: 100,
      isPublished: true,
      myAttempt: null,
      subject: { name: "Full Mock" }
    },
    {
      id: "test-phy-02",
      title: "Physics Mechanics & Gravitation Sectional Quiz",
      durationMinutes: 60,
      totalMarks: 100,
      passingMarks: 35,
      isPublished: true,
      myAttempt: { status: "EVALUATED", score: 84 },
      subject: { name: "Physics" }
    },
    {
      id: "test-math-03",
      title: "Mathematics Calculus & Differential Equations Practice",
      durationMinutes: 90,
      totalMarks: 120,
      passingMarks: 40,
      isPublished: true,
      myAttempt: null,
      subject: { name: "Mathematics" }
    }
  ];

  const sourceTests = tests.length > 0 ? tests : fallbackTests;

  const filteredTests = sourceTests.filter((t: any) => {
    const isCompleted = t.myAttempt?.status === "EVALUATED" || t.myAttempt?.status === "SUBMITTED";
    return activeTab === "COMPLETED" ? isCompleted : !isCompleted;
  });

  return (
    <View style={styles.container}>
      <Header title="Online Examinations" subtitle="Competitive mock tests & sectional quizzes" onBack={onBack} />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("ACTIVE")}
          style={[styles.tabBtn, activeTab === "ACTIVE" && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === "ACTIVE" && styles.tabBtnTextActive]}>
            Available & Live Tests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("COMPLETED")}
          style={[styles.tabBtn, activeTab === "COMPLETED" && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === "COMPLETED" && styles.tabBtnTextActive]}>
            Completed & Scorecards
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {filteredTests.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === "ACTIVE" ? "No Active Tests Available" : "No Completed Tests Yet"}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === "ACTIVE"
                ? "All currently scheduled tests have been attempted or no tests are published."
                : "Complete a mock test to view detailed scoring, ranks, and analysis."}
            </Text>
          </Card>
        ) : (
          filteredTests.map((t: any) => {
            const isEvaluated = t.myAttempt?.status === "EVALUATED" || t.myAttempt?.status === "SUBMITTED";

            return (
              <Card key={t.id} style={styles.testCard}>
                <View style={styles.cardHeader}>
                  <Badge label={t.subject?.name || "CBT Online"} variant="primary" />
                  {isEvaluated ? (
                    <Badge label={`Score: ${t.myAttempt?.score}/${t.totalMarks}`} variant="success" />
                  ) : (
                    <Badge label="Ready" variant="warning" />
                  )}
                </View>

                <Text style={styles.testTitle}>{t.title}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaItem}>⏱ {t.durationMinutes} Mins</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.metaItem}>🎯 Total: {t.totalMarks} Marks</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.metaItem}>Pass: {t.passingMarks}</Text>
                </View>

                <Button
                  title={isEvaluated ? "View Scorecard & Explanations 📊" : "Start Test Attempt 🚀"}
                  variant={isEvaluated ? "outline" : "primary"}
                  onPress={() => onNavigate(isEvaluated ? "result" : "attempt", { testId: t.id })}
                />
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 8
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f1f5f9"
  },
  tabBtnActive: {
    backgroundColor: "#3b82f6"
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b"
  },
  tabBtnTextActive: {
    color: "#ffffff",
    fontWeight: "700"
  },
  scrollList: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 36
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 20
  },
  testCard: {
    marginBottom: 4
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  testTitle: {
    fontWeight: "800",
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 8,
    lineHeight: 20
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14
  },
  metaItem: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600"
  },
  dot: {
    color: "#cbd5e1",
    fontSize: 10
  }
});
