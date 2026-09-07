import React from "react";
import { useRouter } from "expo-router";
import { TestsScreen } from "../../src/screens/main/TestsScreen";

export default function TestsRoute() {
  const router = useRouter();
  return (
    <TestsScreen
      onBack={() => router.back()}
      onNavigate={(screen, params) => {
        router.push({
          pathname: `/(student)/${screen}` as any,
          params: params || {},
        });
      }}
    />
  );
}
