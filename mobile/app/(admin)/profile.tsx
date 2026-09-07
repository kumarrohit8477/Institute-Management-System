import React from "react";
import { useRouter } from "expo-router";
import { AdminProfileScreen } from "../../src/screens/admin/profile";
import { useAuth } from "../../src/hooks/useAuth";

export default function ProfileRoute() {
  const router = useRouter();
  const { logout } = useAuth();
  return (
    <AdminProfileScreen
      onLogout={async () => {
        await logout();
        router.replace("/login");
      }}
    />
  );
}
