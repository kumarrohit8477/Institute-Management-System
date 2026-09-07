import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ResultScreen } from "../../src/screens/main/ExamAttemptScreen";

export default function ResultsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ testId?: string }>();

  return <ResultScreen testId={params.testId} onBack={() => router.back()} />;
}
