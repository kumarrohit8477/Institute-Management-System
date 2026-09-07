import React from "react";
import { useRouter } from "expo-router";
import { TeacherDashboardScreen } from "../../src/screens/teacher/TeacherDashboardScreen";

export default function DashboardRoute() {
  const router = useRouter();
  return (
    <TeacherDashboardScreen
      onNavigate={(screen, params) => {
        let routeName = screen;
        if (screen === "TeacherBatches") routeName = "batches";
        if (screen === "TeacherAttendance") routeName = "attendance";
        if (screen === "TeacherTimetable") routeName = "timetable";
        if (screen === "TeacherProfile") routeName = "profile";

        router.push({
          pathname: `/(teacher)/${routeName}` as any,
          params: params || {},
        });
      }}
    />
  );
}
