import React from "react";
import { useRouter } from "expo-router";
import { TeacherBatchesScreen } from "../../src/screens/teacher/TeacherBatchesScreen";

export default function BatchesRoute() {
  const router = useRouter();
  return (
    <TeacherBatchesScreen
      onBack={() => router.back()}
      onNavigate={(screen, params) => {
        let routeName = screen;
        if (screen === "TeacherAttendance") routeName = "attendance";
        router.push({
          pathname: `/(teacher)/${routeName}` as any,
          params: params || {},
        });
      }}
    />
  );
}
