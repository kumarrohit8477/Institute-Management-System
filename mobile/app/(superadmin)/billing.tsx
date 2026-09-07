import React from "react";
import { useRouter } from "expo-router";
import { PlatformBillingScreen } from "../../src/screens/superadmin/PlatformBillingScreen";

export default function BillingRoute() {
  const router = useRouter();
  return <PlatformBillingScreen onBack={() => router.back()} />;
}
