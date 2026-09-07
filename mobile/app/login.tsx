import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { LoginScreen } from "../src/screens/auth/LoginScreen";
import { useAuth } from "../src/hooks/useAuth";

export default function LoginRoute() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      switch (role) {
        case "SUPER_ADMIN":
          router.replace("/(superadmin)/dashboard");
          break;
        case "ADMIN":
          router.replace("/(admin)/dashboard");
          break;
        case "TEACHER":
          router.replace("/(teacher)/dashboard");
          break;
        case "STUDENT":
          router.replace("/(student)/dashboard");
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, role, isLoading, router]);

  return <LoginScreen />;
}
