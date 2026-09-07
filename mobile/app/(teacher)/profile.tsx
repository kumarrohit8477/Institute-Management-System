import React from "react";
import { useRouter } from "expo-router";
import { TeacherProfileScreen } from "../../src/screens/teacher/TeacherProfileScreen";
import { useAuth } from "../../src/hooks/useAuth";

export default function ProfileRoute() {
  const router = useRouter();
  const { logout } = useAuth();
  return (
    <TeacherProfileScreen
      onLogout={async () => {
        await logout();
        router.replace("/login");
      }}
    />
  );
}
