import React from "react";
import { useRouter } from "expo-router";
import { CoursesScreen } from "../../src/screens/main/CoursesScreen";

export default function CoursesRoute() {
  const router = useRouter();
  return <CoursesScreen onBack={() => router.back()} />;
}
