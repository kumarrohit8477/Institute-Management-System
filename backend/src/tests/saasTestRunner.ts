/**
 * ==============================================================================
 * INSTITUTE MANAGEMENT SYSTEM — SAAS MULTI-TENANT PLATFORM TEST RUNNER
 * Tests:
 * 1. Platform Overview & SaaS KPIs (MRR / ARR / Tenant counts)
 * 2. Onboard New Tenant Institute with Admin & Subscription
 * 3. Institute Query & Status Transitions (Active -> Suspended -> Active)
 * 4. Plan Upgrade Engine (Starter -> Growth)
 * 5. B2B Platform Invoice Generation & Payment Clearance
 * 6. Usage Tracker & Quota Limit Enforcement
 * ==============================================================================
 */

import { SaasService } from "../services/saas.service";
import { UsageTrackerService } from "../services/usageTracker.service";
import { PlanTier, BillingCycle, InstituteStatus, InvoiceStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

async function runSaasVerification() {
  console.log("\n================================================================================");
  console.log("   PHASE 13: SAAS MULTI-TENANCY & SUPER ADMIN PLATFORM VERIFICATION");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}${detail ? ` (${detail})` : ""}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` (${detail})` : ""}`);
      failed++;
    }
  };

  try {
    // -------------------------------------------------------------------------
    // 1. Platform Overview
    // -------------------------------------------------------------------------
    console.log("▶ 1. PLATFORM OVERVIEW & REVENUE ANALYTICS");
    const overview = await SaasService.getPlatformOverview();
    assert(overview.kpis.totalInstitutes >= 1, "Platform KPI: Total Registered Institutes Tracked", `Count: ${overview.kpis.totalInstitutes}`);
    assert(typeof overview.kpis.monthlyRecurringRevenue === "number", "MRR Metric Computed", `₹${overview.kpis.monthlyRecurringRevenue}/mo`);

    // -------------------------------------------------------------------------
    // 2. Onboard New Tenant Institute
    // -------------------------------------------------------------------------
    console.log("\n▶ 2. ONBOARDING NEW TENANT INSTITUTE (B2B SAAS FLOW)");
    const testCode = `TEST_INST_${Date.now()}`;
    const newTenant = await SaasService.onboardInstituteTenant({
      name: "Pinnacle IIT-JEE Academy",
      code: testCode,
      customDomain: `${testCode.toLowerCase()}.ims.local`,
      email: `${testCode.toLowerCase()}@pinnacle.local`,
      phone: "+91 9988776655",
      address: "Sector 62, Noida, UP",
      adminEmail: `admin@${testCode.toLowerCase()}.local`,
      adminPassword: "TenantSecureAdminPass123!",
      planTier: PlanTier.STARTER,
      billingCycle: BillingCycle.MONTHLY
    });

    assert(newTenant.institute.code === testCode, "Tenant Institute Record Created", newTenant.institute.name);
    assert(newTenant.subscription.tier === PlanTier.STARTER, "Starter Subscription Plan Attached", newTenant.subscription.planName);
    assert(newTenant.adminUser.role === "ADMIN", "Tenant Administrator User Generated", newTenant.adminUser.email);
    assert(Number(newTenant.invoice.totalAmount) > 0, "B2B SaaS Initial Invoice Generated", `Invoice: ${newTenant.invoice.invoiceNumber}, Amount: ₹${newTenant.invoice.totalAmount}`);

    // -------------------------------------------------------------------------
    // 3. Institute Query & Status Management
    // -------------------------------------------------------------------------
    console.log("\n▶ 3. TENANT DIRECTORY & LIFECYCLE MANAGEMENT");
    const institutesList = await SaasService.getAllInstitutes({ search: testCode });
    assert(institutesList.institutes.length === 1, "Tenant Lookup by Alphanumeric Code Succeeded");

    const suspended = await SaasService.updateInstituteStatus(newTenant.institute.id, InstituteStatus.SUSPENDED);
    assert(suspended.status === InstituteStatus.SUSPENDED, "Tenant Status Transition: SUSPENDED");

    const reactivated = await SaasService.updateInstituteStatus(newTenant.institute.id, InstituteStatus.ACTIVE);
    assert(reactivated.status === InstituteStatus.ACTIVE, "Tenant Status Transition: REACTIVATED (ACTIVE)");

    // -------------------------------------------------------------------------
    // 4. Plan Upgrade Engine (Starter -> Growth)
    // -------------------------------------------------------------------------
    console.log("\n▶ 4. SAAS PLAN UPGRADE & PRORATION ENGINE");
    const upgraded = await SaasService.changeInstituteSubscription(newTenant.institute.id, {
      planTier: PlanTier.GROWTH,
      billingCycle: BillingCycle.ANNUAL,
      autoRenew: true
    });
    assert(upgraded.subscription.plan.tier === PlanTier.GROWTH, "Tenant Subscription Upgraded to GROWTH Plan");
    assert(!!upgraded.invoice && Number(upgraded.invoice.totalAmount) > 0, "Annual Upgrade B2B Invoice Generated", `Amount: ₹${upgraded.invoice?.totalAmount}`);

    // -------------------------------------------------------------------------
    // 5. B2B Invoice Payment Clearance
    // -------------------------------------------------------------------------
    console.log("\n▶ 5. B2B INVOICE CLEARANCE & SUBSCRIPTION RE-ACTIVATION");
    if (upgraded.invoice) {
      const clearedInvoice = await SaasService.recordInvoicePayment(
        upgraded.invoice.id,
        "BANK_TRANSFER",
        `UTR-${Date.now()}`
      );
      assert(clearedInvoice.status === InvoiceStatus.PAID, "B2B Platform Invoice Marked as PAID", clearedInvoice.invoiceNumber);
    }

    // -------------------------------------------------------------------------
    // 6. Real-Time Tenant Quota & Usage Tracking
    // -------------------------------------------------------------------------
    console.log("\n▶ 6. TENANT RESOURCE USAGE TRACKER & QUOTA CHECK");
    const usage = await UsageTrackerService.syncTenantUsage(newTenant.institute.id);
    assert(typeof usage.studentCount === "number", "Tenant Live Usage Synchronized (Students/Courses/Batches)");

    // Quota evaluation check
    const plan = upgraded.subscription.plan;
    const isWithinQuota = usage.studentCount < plan.maxStudents;
    assert(isWithinQuota, `Student Quota Check: ${usage.studentCount} / ${plan.maxStudents} (Within ${plan.name} limits)`);
    assert(plan.hasOnlineCBT === true, "Plan Feature Flag Check: Online CBT Engine Enabled");

    // -------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // -------------------------------------------------------------------------
    await prisma.institute.delete({ where: { id: newTenant.institute.id } });

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`   SAAS VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ SaaS Test Execution Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSaasVerification();
