import React from "react";
import { useRouter } from "expo-router";
import { ProfileScreen } from "../../src/screens/main/FeesScreen";
import { useAuth } from "../../src/hooks/useAuth";

export default function ProfileRoute() {
  const router = useRouter();
  const { logout } = useAuth();
  return (
    <ProfileScreen
      onBack={async () => {
        await logout();
        router.replace("/login");
      }}
    />
  );
}
