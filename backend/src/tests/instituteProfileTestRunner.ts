/**
 * ==============================================================================
 * INSTITUTE MANAGEMENT SYSTEM — INSTITUTE & ADMIN PROFILE VERIFICATION SUITE
 * Complete Verification for:
 * 1. Fetch Current Institute Details including Tenant Usage & Relation Counts
 * 2. Verify Subscription Plan and Limits attached to Institute
 * 3. Update Institute Profile / Contact Information (Name, Phone, Address, Website)
 * 4. Verify Database Persistence of Updated Profile
 * ==============================================================================
 */

import { InstituteService } from "../services/institute.service";
import { prisma } from "../config/prisma";

async function runInstituteProfileVerification() {
  console.log("\n================================================================================");
  console.log("   INSTITUTE PROFILE & METADATA VERIFICATION SUITE");
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
    const institute = await prisma.institute.findFirst({
      where: { code: "INST001" }
    });

    if (!institute) {
      throw new Error("Default institute INST001 not found. Please ensure database is seeded.");
    }

    // -------------------------------------------------------------------------
    // TEST 1: Retrieve Current Institute with Subscriptions, Counts & Usage
    // -------------------------------------------------------------------------
    console.log("▶ 1. FETCH INSTITUTE PROFILE WITH RELATIONS");
    const current = await InstituteService.getCurrentInstitute(institute.id);

    assert(current.id === institute.id, "Institute ID verified", current.id);
    assert(current.code === "INST001", "Campus Code verified", current.code);
    assert(current.subscription !== undefined, "Subscription object attached to institute profile");
    assert(current.subscription?.plan !== undefined, "Subscription plan details attached", current.subscription?.plan?.name);
    assert(current._count !== undefined, "Relation counts object present");
    assert(typeof current._count?.students === "number", "Student count present in _count", String(current._count?.students));
    assert(typeof current._count?.courses === "number", "Course count present in _count", String(current._count?.courses));

    // -------------------------------------------------------------------------
    // TEST 2: Update Institute Profile Contact Details
    // -------------------------------------------------------------------------
    console.log("\n▶ 2. UPDATE INSTITUTE CONTACT DETAILS");
    const updatePayload = {
      phone: "+91 9988776655",
      address: "456 Innovation Boulevard, High-Tech Zone, Bangalore, Karnataka 560100",
      website: "https://apex-campus.ims.local",
      tagline: "Excellence in Modern Education & Leadership"
    };

    const updateRes = await InstituteService.updateProfile(institute.id, updatePayload);
    assert(updateRes.phone === updatePayload.phone, "Phone number updated", updateRes.phone);
    assert(updateRes.address === updatePayload.address, "Physical address updated", updateRes.address || "");
    assert(updateRes.website === updatePayload.website, "Website URL updated", updateRes.website || "");
    assert(updateRes.tagline === updatePayload.tagline, "Tagline updated via profile endpoint", updateRes.tagline || "");

    // -------------------------------------------------------------------------
    // TEST 3: Direct Database Verification
    // -------------------------------------------------------------------------
    console.log("\n▶ 3. DIRECT DB VERIFICATION OF UPDATED PROFILE");
    const dbRecord = await prisma.institute.findUnique({
      where: { id: institute.id }
    });
    assert(dbRecord?.phone === updatePayload.phone, "DB reflects updated phone");
    assert(dbRecord?.website === updatePayload.website, "DB reflects updated website");

  } catch (err: any) {
    console.error("Test execution failed with error:", err);
    failed++;
  } finally {
    console.log("\n================================================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log("================================================================================\n");
    await prisma.$disconnect();
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runInstituteProfileVerification();
