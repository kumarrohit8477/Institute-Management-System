import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator
} from "react-native";
import {
  MobileExamService,
  StartAttemptResponse,
  TestResultData,
  ExamQuestion
} from "../../services/examService";
import { Header, Card, Badge, Button } from "../../components/Header";

export const ExamAttemptScreen: React.FC<{
  testId?: string;
  onFinish: (testId: string) => void;
  onBack?: () => void;
}> = ({ testId = "test-jee-01", onFinish, onBack }) => {
  const [testData, setTestData] = useState<StartAttemptResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionIds?: string[]; textAnswer?: string }>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180 * 60);
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize test from API
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const res = await MobileExamService.startAttempt(testId);
        if (mounted && res && res.test) {
          setTestData(res);
          setSecondsRemaining(res.attempt?.remainingSeconds || res.test.durationMinutes * 60);

          const prefilled: Record<string, any> = {};
          for (const ans of res.attempt?.savedAnswers || []) {
            prefilled[ans.questionId] = {
              selectedOptionIds: ans.selectedOptionIds || [],
              textAnswer: ans.textAnswer || ""
            };
          }
          setAnswers(prefilled);
        }
      } catch {
        // API error
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [testId]);

  // Countdown timer with auto-submit
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const questions = testData?.test?.questions || [];
  const currentQ = questions[currentIdx];
  const qId = currentQ?.questionId || currentQ?.id || "";

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleOptionSelect = async (optId: string) => {
    const qType = currentQ.question?.type || "SINGLE_CHOICE";
    let newSelected: string[] = [];

    if (qType === "SINGLE_CHOICE" || qType === "TRUE_FALSE") {
      newSelected = [optId];
    } else if (qType === "MULTIPLE_CHOICE") {
      const current = answers[qId]?.selectedOptionIds || [];
      if (current.includes(optId)) {
        newSelected = current.filter((id) => id !== optId);
      } else {
        newSelected = [...current, optId];
      }
    }

    const updated = {
      ...answers,
      [qId]: { ...answers[qId], selectedOptionIds: newSelected }
    };
    setAnswers(updated);

    // Auto-save to backend
    try {
      await MobileExamService.saveAnswer(testId, {
        questionId: qId,
        selectedOptionIds: newSelected
      });
    } catch {
      // Background auto-save
    }
  };

  const handleClearResponse = async () => {
    const updated = { ...answers };
    delete updated[qId];
    setAnswers(updated);

    try {
      await MobileExamService.saveAnswer(testId, {
        questionId: qId,
        selectedOptionIds: []
      });
    } catch {
      // Clear response
    }
  };

  const handleToggleReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await MobileExamService.submitAttempt(testId);
    } catch (err) {
      console.warn("Submit attempt fallback:", err);
    } finally {
      setIsSubmitting(false);
      setSubmitModalOpen(false);
      onFinish(testId);
    }
  };

  // Status counts for palette
  const answeredCount = Object.keys(answers).filter(
    (k) => (answers[k]?.selectedOptionIds?.length || 0) > 0
  ).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Initializing Examination Environment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top App Bar with Timer & Palette trigger */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.qIndexText}>
            Question {currentIdx + 1} of {questions.length}
          </Text>
          <Text style={styles.marksText}>
            +{currentQ.marks || 4} Marks • -{currentQ.negativeMarks || 1} Neg
          </Text>
        </View>

        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏱ {formatTimer(secondsRemaining)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setPaletteOpen(true)}
          style={styles.paletteBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.paletteBtnText}>Grid 📑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <Card style={styles.questionCard}>
          <View style={styles.qMetaRow}>
            <Badge label={currentQ.question?.type || "SINGLE CHOICE"} variant="primary" />
            {markedForReview[qId] ? (
              <Badge label="Marked For Review" variant="warning" />
            ) : null}
          </View>

          <Text style={styles.questionText}>{currentQ.question?.questionText}</Text>

          {/* Options List */}
          <View style={styles.optionsList}>
            {currentQ.question?.options?.map((opt, idx) => {
              const isSelected = (answers[qId]?.selectedOptionIds || []).includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleOptionSelect(opt.id)}
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optIndicator, isSelected && styles.optIndicatorSelected]}>
                    <Text style={[styles.optIndicatorText, isSelected && styles.optIndicatorTextSelected]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt.optionText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Question Secondary Actions */}
        <View style={styles.actionRow}>
          <Button
            title="Clear Selection"
            variant="outline"
            onPress={handleClearResponse}
            style={styles.smallBtn}
          />
          <Button
            title={markedForReview[qId] ? "Unmark Review" : "Mark & Next"}
            variant="outline"
            onPress={handleToggleReview}
            style={styles.smallBtn}
          />
        </View>

        {/* Navigation Row */}
        <View style={styles.navRow}>
          <Button
            title="← Previous"
            variant="outline"
            disabled={currentIdx === 0}
            onPress={() => setCurrentIdx(currentIdx - 1)}
            style={styles.navBtn}
          />

          {currentIdx < questions.length - 1 ? (
            <Button
              title="Next Question →"
              variant="primary"
              onPress={() => setCurrentIdx(currentIdx + 1)}
              style={styles.navBtn}
            />
          ) : (
            <Button
              title="Submit Exam 🏁"
              variant="success"
              onPress={() => setSubmitModalOpen(true)}
              style={styles.navBtn}
            />
          )}
        </View>
      </ScrollView>

      {/* Question Palette Modal */}
      <Modal visible={paletteOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.paletteModal}>
            <View style={styles.paletteHeader}>
              <Text style={styles.paletteTitle}>Question Navigation Palette</Text>
              <TouchableOpacity onPress={() => setPaletteOpen(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
                <Text style={styles.legendLabel}>Answered ({answeredCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
                <Text style={styles.legendLabel}>Review ({reviewCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#cbd5e1" }]} />
                <Text style={styles.legendLabel}>Unanswered ({unansweredCount})</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.gridPalette}>
              {questions.map((q, idx) => {
                const curId = q.questionId || q.id;
                const isAns = (answers[curId]?.selectedOptionIds?.length || 0) > 0;
                const isRev = !!markedForReview[curId];
                const isCur = idx === currentIdx;

                let btnBg = "#f1f5f9";
                let textClr = "#0f172a";
                if (isRev) {
                  btnBg = "#fef3c7";
                  textClr = "#b45309";
                } else if (isAns) {
                  btnBg = "#dcfce7";
                  textClr = "#15803d";
                }

                return (
                  <TouchableOpacity
                    key={curId}
                    onPress={() => {
                      setCurrentIdx(idx);
                      setPaletteOpen(false);
                    }}
                    style={[
                      styles.paletteGridBtn,
                      { backgroundColor: btnBg },
                      isCur && styles.paletteGridBtnCurrent
                    ]}
                  >
                    <Text style={[styles.paletteGridText, { color: textClr }]}>
                      {idx + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Button
              title="Close Palette"
              variant="outline"
              onPress={() => setPaletteOpen(false)}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* Submission Confirmation Modal */}
      <Modal visible={submitModalOpen} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.submitModalCard}>
            <Text style={styles.submitModalTitle}>Ready to Submit Test?</Text>
            <Text style={styles.submitModalSub}>
              Please review your test attempt summary before finalizing.
            </Text>

            <View style={styles.summaryBox}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: "#10b981" }]}>{answeredCount}</Text>
                <Text style={styles.summaryLbl}>Answered</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: "#ef4444" }]}>{unansweredCount}</Text>
                <Text style={styles.summaryLbl}>Unattempted</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: "#f59e0b" }]}>{reviewCount}</Text>
                <Text style={styles.summaryLbl}>For Review</Text>
              </View>
            </View>

            <View style={{ gap: 10, marginTop: 16 }}>
              <Button
                title={isSubmitting ? "Submitting..." : "Yes, Submit Final Answers"}
                variant="success"
                disabled={isSubmitting}
                onPress={handleFinalSubmit}
              />
              <Button
                title="Cancel & Continue Test"
                variant="outline"
                onPress={() => setSubmitModalOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const ResultScreen: React.FC<{
  testId?: string;
  onBack?: () => void;
}> = ({ testId = "test-jee-01", onBack }) => {
  const [result, setResult] = useState<TestResultData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    MobileExamService.getResult(testId)
      .then(setResult)
      .catch((err) => {
        console.warn("Result fallback:", err);
      })
      .finally(() => setLoading(false));
  }, [testId]);

  const mockResult = result;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Fetching Test Scorecard...</Text>
      </View>
    );
  }

  if (!mockResult) {
    return (
      <View style={styles.container}>
        <Header title="Exam Scorecard" subtitle="Results & Analysis" onBack={onBack} />
        <View style={[styles.center, { flex: 1 }]}>
          <Text style={{ fontSize: 16, color: "#64748b", fontWeight: "700" }}>
            No scorecard data available for this test attempt.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Exam Scorecard" subtitle="Results, Analytics & Explanations" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Score Card */}
        <View style={styles.scoreBanner}>
          <Text style={styles.scoreTestName}>{mockResult.test?.title || "Examination"}</Text>
          <Text style={styles.scoreBig}>
            {mockResult.totalMarksObtained ?? 0}{" "}
            <Text style={styles.scoreMax}>/ {mockResult.test?.totalMarks ?? 0}</Text>
          </Text>

          <View style={styles.scoreMetricsRow}>
            {mockResult.rank ? (
              <>
                <Text style={styles.metricItem}>
                  🏆 Rank: <Text style={styles.metricBold}>#{mockResult.rank}</Text>
                </Text>
                <Text style={styles.metricDot}>•</Text>
              </>
            ) : null}
            <Text style={styles.metricItem}>
              📈 Percentage: <Text style={styles.metricBold}>{mockResult.percentage ?? 0}%</Text>
            </Text>
          </View>
        </View>

        {/* Breakdown Grid */}
        <View style={styles.breakdownGrid}>
          <Card style={styles.breakdownCard}>
            <Text style={styles.breakdownLabel}>CORRECT</Text>
            <Text style={[styles.breakdownValue, { color: "#10b981" }]}>
              {mockResult.attempt?.totalCorrect ?? 0}
            </Text>
          </Card>
          <Card style={styles.breakdownCard}>
            <Text style={styles.breakdownLabel}>INCORRECT</Text>
            <Text style={[styles.breakdownValue, { color: "#ef4444" }]}>
              {mockResult.attempt?.totalIncorrect ?? 0}
            </Text>
          </Card>
        </View>

        {/* Recommendation Card */}
        {mockResult.remarks ? (
          <Card style={styles.remarkCard}>
            <Text style={styles.remarkTitle}>💡 Performance Insights</Text>
            <Text style={styles.remarkText}>{mockResult.remarks}</Text>
          </Card>
        ) : null}

        {/* Question-by-Question Detailed Review */}
        {mockResult.attempt?.studentAnswers?.length ? (
          <>
            <Text style={styles.reviewHeader}>Question-by-Question Solution Review</Text>
            {mockResult.attempt.studentAnswers.map((sa, idx) => {
              const isCorrect = sa.isCorrect;
              return (
                <Card key={sa.id || idx} style={styles.reviewCard}>
                  <View style={styles.reviewCardTop}>
                    <Text style={styles.reviewQIndex}>Question {idx + 1}</Text>
                    <Badge
                      label={isCorrect ? `+${sa.marksAwarded} Correct` : `${sa.marksAwarded} Incorrect`}
                      variant={isCorrect ? "success" : "danger"}
                    />
                  </View>

                  <Text style={styles.reviewQText}>{sa.question?.questionText}</Text>

                  {/* Options status */}
                  <View style={styles.reviewOptionsList}>
                    {sa.question?.options?.map((opt) => (
                      <View
                        key={opt.id}
                        style={[
                          styles.reviewOptItem,
                          opt.isCorrect && styles.reviewOptItemCorrect
                        ]}
                      >
                        <Text style={[styles.reviewOptText, opt.isCorrect && styles.reviewOptTextCorrect]}>
                          {opt.isCorrect ? "✓ " : "• "} {opt.optionText}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Explanation */}
                  {sa.question?.explanation ? (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationTitle}>Detailed Solution:</Text>
                      <Text style={styles.explanationText}>{sa.question.explanation}</Text>
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 12
  },
  topBar: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  qIndexText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14
  },
  marksText: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2
  },
  timerBadge: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  timerText: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "800"
  },
  paletteBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  paletteBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700"
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },
  questionCard: {
    padding: 18
  },
  qMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  questionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 22,
    marginBottom: 16
  },
  optionsList: {
    gap: 10
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  optionItemSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff"
  },
  optIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  optIndicatorSelected: {
    backgroundColor: "#3b82f6"
  },
  optIndicatorText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569"
  },
  optIndicatorTextSelected: {
    color: "#ffffff"
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b"
  },
  optionTextSelected: {
    color: "#1d4ed8",
    fontWeight: "700"
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  smallBtn: {
    flex: 1
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4
  },
  navBtn: {
    flex: 1
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  paletteModal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%"
  },
  paletteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a"
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#64748b",
    padding: 4
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 14
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569"
  },
  gridPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 8
  },
  paletteGridBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  paletteGridBtnCurrent: {
    borderColor: "#3b82f6",
    borderWidth: 2
  },
  paletteGridText: {
    fontSize: 14,
    fontWeight: "800"
  },
  submitModalCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignSelf: "stretch",
    marginBottom: "auto",
    marginTop: "auto"
  },
  submitModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 4
  },
  submitModalSub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  summaryItem: {
    alignItems: "center"
  },
  summaryVal: {
    fontSize: 22,
    fontWeight: "900"
  },
  summaryLbl: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  scoreBanner: {
    backgroundColor: "#1e3a8a",
    borderRadius: 18,
    padding: 24,
    alignItems: "center"
  },
  scoreTestName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#93c5fd",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center"
  },
  scoreBig: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    marginVertical: 6
  },
  scoreMax: {
    fontSize: 18,
    color: "#93c5fd",
    fontWeight: "600"
  },
  scoreMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6
  },
  metricItem: {
    fontSize: 12,
    color: "#e0e7ff"
  },
  metricBold: {
    fontWeight: "700",
    color: "#ffffff"
  },
  metricDot: {
    color: "#93c5fd"
  },
  breakdownGrid: {
    flexDirection: "row",
    gap: 10
  },
  breakdownCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b"
  },
  breakdownValue: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2
  },
  remarkCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0"
  },
  remarkTitle: {
    fontWeight: "700",
    fontSize: 13,
    color: "#15803d",
    marginBottom: 4
  },
  remarkText: {
    fontSize: 12,
    color: "#166534",
    lineHeight: 18
  },
  reviewHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 10,
    marginBottom: 2
  },
  reviewCard: {
    marginBottom: 4
  },
  reviewCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  reviewQIndex: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a"
  },
  reviewQText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    lineHeight: 19,
    marginBottom: 12
  },
  reviewOptionsList: {
    gap: 6,
    marginBottom: 10
  },
  reviewOptItem: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc"
  },
  reviewOptItemCorrect: {
    backgroundColor: "#dcfce7"
  },
  reviewOptText: {
    fontSize: 12,
    color: "#475569"
  },
  reviewOptTextCorrect: {
    color: "#15803d",
    fontWeight: "700"
  },
  explanationBox: {
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 8,
    marginTop: 6
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 2
  },
  explanationText: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 16
  }
});
