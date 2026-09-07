import React from "react";
import { useRouter } from "expo-router";
import { AdminCoursesScreen } from "../../src/screens/admin/courses";

export default function CoursesRoute() {
  const router = useRouter();
  return <AdminCoursesScreen onBack={() => router.back()} />;
}
