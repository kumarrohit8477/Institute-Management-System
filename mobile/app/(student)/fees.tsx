import React from "react";
import { useRouter } from "expo-router";
import { FeesScreen } from "../../src/screens/main/FeesScreen";

export default function FeesRoute() {
  const router = useRouter();
  return <FeesScreen onBack={() => router.back()} />;
}
