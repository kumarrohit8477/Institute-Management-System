import React from "react";
import { useRouter } from "expo-router";
import { SuperAdminProfileScreen } from "../../src/screens/superadmin/SuperAdminProfileScreen";
import { useAuth } from "../../src/hooks/useAuth";

export default function ProfileRoute() {
  const router = useRouter();
  const { logout } = useAuth();
  return (
    <SuperAdminProfileScreen
      onLogout={async () => {
        await logout();
        router.replace("/login");
      }}
    />
  );
}
