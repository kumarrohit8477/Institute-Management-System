import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ExamAttemptScreen } from "../../src/screens/main/ExamAttemptScreen";

export default function AttemptRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ testId?: string }>();

  return (
    <ExamAttemptScreen
      testId={params.testId || ""}
      onBack={() => router.back()}
      onFinish={(testId) => {
        router.replace({
          pathname: "/(student)/results",
          params: { testId },
        });
      }}
    />
  );
}
