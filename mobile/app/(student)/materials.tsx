import React from "react";
import { useRouter } from "expo-router";
import { MaterialsScreen } from "../../src/screens/main/TimetableScreen";

export default function MaterialsRoute() {
  const router = useRouter();
  return <MaterialsScreen onBack={() => router.back()} />;
}
