import React from "react";
import { useRouter } from "expo-router";
import { TimetableScreen } from "../../src/screens/main/TimetableScreen";

export default function TimetableRoute() {
  const router = useRouter();
  return <TimetableScreen onBack={() => router.back()} />;
}
