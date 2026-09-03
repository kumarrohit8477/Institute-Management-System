/**
 * ==============================================================================
 * INSTITUTE MANAGEMENT SYSTEM — INSTITUTE TAGLINE / SLOGAN TEST SUITE
 * Complete Verification for:
 * 1. Fetch Current Institute Details including Tagline
 * 2. Update Tagline / Slogan via InstituteService.updateTagline
 * 3. Verify Database Persistence & Query Reflection
 * 4. Update with Different Slogan Strings & White-space Trimming
 * 5. Clear / Reset Tagline to null (Empty string or null)
 * ==============================================================================
 */

import { InstituteService } from "../services/institute.service";
import { prisma } from "../config/prisma";

async function runInstituteBrandingVerification() {
  console.log("\n================================================================================");
  console.log("   INSTITUTE BRANDING: TAGLINE / SLOGAN MANAGEMENT VERIFICATION SUITE");
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
    // 1. Fetch default test institute
    const institute = await prisma.institute.findFirst({
      where: { code: "INST001" }
    });

    if (!institute) {
      throw new Error("Default institute INST001 not found. Please ensure database is seeded.");
    }

    // -------------------------------------------------------------------------
    // TEST 1: Retrieve Current Institute Info & Tagline Presence
    // -------------------------------------------------------------------------
    console.log("▶ 1. FETCH CURRENT INSTITUTE DETAILS & TAGLINE ATTRIBUTE");
    const current = await InstituteService.getCurrentInstitute(institute.id);
    assert(current.id === institute.id && current.code === "INST001", "Institute Details Retrieved", current.name);
    assert("tagline" in current, "Institute Details includes 'tagline' property");

    // -------------------------------------------------------------------------
    // TEST 2: Update Institute Tagline / Slogan
    // -------------------------------------------------------------------------
    console.log("\n▶ 2. UPDATE INSTITUTE TAGLINE / SLOGAN");
    const testTagline = "Empowering Minds, Shaping the Future";
    const updateRes = await InstituteService.updateTagline(institute.id, testTagline);
    assert(updateRes.tagline === testTagline, "Tagline returned in update response", updateRes.tagline || "");

    // Verify in DB directly
    const dbRecord1 = await prisma.institute.findUnique({
      where: { id: institute.id }
    });
    assert(dbRecord1?.tagline === testTagline, "Tagline directly verified in MySQL database", dbRecord1?.tagline || "");

    // -------------------------------------------------------------------------
    // TEST 3: Reflect in getCurrentInstitute
    // -------------------------------------------------------------------------
    console.log("\n▶ 3. VERIFY TAGLINE IN GET CURRENT INSTITUTE");
    const currentAfterUpdate = await InstituteService.getCurrentInstitute(institute.id);
    assert(currentAfterUpdate.tagline === testTagline, "getCurrentInstitute reflects newly updated tagline");

    // -------------------------------------------------------------------------
    // TEST 4: Trim Whitespace on Slogan Update
    // -------------------------------------------------------------------------
    console.log("\n▶ 4. TEST SLOGAN UPDATE WITH LEADING/TRAILING WHITESPACE");
    const rawTagline = "   Excellence in Higher Education & Innovation   ";
    const expectedTrimmed = "Excellence in Higher Education & Innovation";
    const trimRes = await InstituteService.updateTagline(institute.id, rawTagline);
    assert(trimRes.tagline === expectedTrimmed, "Tagline correctly trimmed of leading and trailing whitespace");

    // -------------------------------------------------------------------------
    // TEST 5: Clear / Reset Tagline to Null
    // -------------------------------------------------------------------------
    console.log("\n▶ 5. CLEAR / RESET INSTITUTE TAGLINE");
    const clearRes = await InstituteService.updateTagline(institute.id, null);
    assert(clearRes.tagline === null, "Tagline reset to null in service response");

    const dbRecordCleared = await prisma.institute.findUnique({
      where: { id: institute.id }
    });
    assert(dbRecordCleared?.tagline === null, "Tagline verified as null in database");

    // Test passing whitespace-only string should also resolve to null
    const emptyStringRes = await InstituteService.updateTagline(institute.id, "   ");
    assert(emptyStringRes.tagline === null, "Empty / whitespace string sets tagline to null");

    // -------------------------------------------------------------------------
    // TEST 6: Set Official Institute Motto for Demo
    // -------------------------------------------------------------------------
    console.log("\n▶ 6. SET OFFICIAL DEMO SLOGAN FOR CAMPUS");
    const officialSlogan = "Excellence in Modern Education";
    const finalSet = await InstituteService.updateTagline(institute.id, officialSlogan);
    assert(finalSet.tagline === officialSlogan, "Demo institute tagline set to official slogan", officialSlogan);

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

runInstituteBrandingVerification();
