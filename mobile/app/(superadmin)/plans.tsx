import React from "react";
import { useRouter } from "expo-router";
import { SubscriptionPlansScreen } from "../../src/screens/superadmin/SubscriptionPlansScreen";

export default function PlansRoute() {
  const router = useRouter();
  return <SubscriptionPlansScreen onBack={() => router.back()} />;
}
