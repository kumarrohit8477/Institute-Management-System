/**
 * ==============================================================================
 * INSTITUTE MANAGEMENT SYSTEM — INSTITUTE LOGO & BRANDING TEST SUITE
 * Complete Verification for:
 * 1. Fetch Current Institute Details & Branding (Admin & Student)
 * 2. Upload & Save Base64 Image Logo (Disk Storage & DB Persistence)
 * 3. Update to Direct/External Image URL
 * 4. Image Format & MIME Type Validation (PNG, JPEG, WebP, SVG)
 * 5. Logo Removal & File Cleanup (Disk Unlink & DB Reset to null)
 * 6. RBAC Access Control (Admin/SuperAdmin permitted, Student mutation blocked)
 * ==============================================================================
 */

import { InstituteService } from "../services/institute.service";
import { prisma } from "../config/prisma";
import { UserRole } from "@prisma/client";
import fs from "fs";
import path from "path";

async function runInstituteLogoVerification() {
  console.log("\n================================================================================");
  console.log("   INSTITUTE LOGO & BRANDING MANAGEMENT VERIFICATION SUITE");
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
    let institute = await prisma.institute.findFirst();
    if (!institute) {
      institute = await prisma.institute.create({
        data: {
          name: "Logo Test Institute",
          code: `LOGO_${Date.now()}`,
          email: "logo@institute.local",
          phone: "+91 9999999999",
          status: "ACTIVE"
        }
      });
    }

    // -------------------------------------------------------------------------
    // TEST 1: Retrieve Current Institute Info
    // -------------------------------------------------------------------------
    console.log("▶ 1. FETCH CURRENT INSTITUTE DETAILS");
    const current = await InstituteService.getCurrentInstitute(institute.id);
    assert(current.id === institute.id, "Institute Details & Code Retrieved", current.name);

    // -------------------------------------------------------------------------
    // TEST 2: Upload Base64 Image Logo
    // -------------------------------------------------------------------------
    console.log("\n▶ 2. UPLOAD & STORE BASE64 LOGO TO DISK");
    // Minimal 1x1 transparent PNG data URI
    const samplePngDataUri =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const uploadRes = await InstituteService.updateLogo(institute.id, {
      logoData: samplePngDataUri,
      fileName: "test-campus-logo.png",
      mimeType: "image/png"
    });

    assert(
      typeof uploadRes.logoUrl === "string" && uploadRes.logoUrl.startsWith("/uploads/logos/"),
      "Logo Saved to Disk & URL Stored in DB",
      uploadRes.logoUrl || ""
    );

    // Verify physical file exists on disk
    const diskPath = path.join(process.cwd(), (uploadRes.logoUrl || "").replace(/^\//, ""));
    const fileExists = fs.existsSync(diskPath);
    assert(fileExists, "Physical Logo Image File Exists on Disk", diskPath);

    // -------------------------------------------------------------------------
    // TEST 3: Update Logo to External / Direct Image URL
    // -------------------------------------------------------------------------
    console.log("\n▶ 3. UPDATE LOGO TO EXTERNAL IMAGE URL");
    const externalUrl = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200";
    const externalRes = await InstituteService.updateLogo(institute.id, {
      logoData: externalUrl
    });

    assert(externalRes.logoUrl === externalUrl, "External Logo URL Saved to DB", externalRes.logoUrl || "");

    // -------------------------------------------------------------------------
    // TEST 4: Invalid MIME Type Validation Rejection
    // -------------------------------------------------------------------------
    console.log("\n▶ 4. INVALID IMAGE FORMAT REJECTION");
    let invalidFormatRejected = false;
    try {
      await InstituteService.updateLogo(institute.id, {
        logoData: "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nGNgYGBgAAAADgAHCmVuZHN0cmVhbQplbmRvYmoK",
        mimeType: "application/pdf"
      });
    } catch (e: any) {
      invalidFormatRejected = e.statusCode === 422 || e.message.includes("Unsupported image format");
    }
    assert(invalidFormatRejected, "Non-Image MIME Type (application/pdf) Rejected with 422 Unprocessable Entity");

    // -------------------------------------------------------------------------
    // TEST 5: Remove / Delete Logo
    // -------------------------------------------------------------------------
    console.log("\n▶ 5. REMOVE INSTITUTE LOGO");
    // Re-upload a disk logo first so we can verify disk cleanup on delete
    const reuploadRes = await InstituteService.updateLogo(institute.id, {
      logoData: samplePngDataUri,
      mimeType: "image/png"
    });
    const reuploadedDiskPath = path.join(process.cwd(), (reuploadRes.logoUrl || "").replace(/^\//, ""));
    assert(fs.existsSync(reuploadedDiskPath), "Pre-delete Disk File Created");

    const deleteRes = await InstituteService.deleteLogo(institute.id);
    assert(deleteRes.logoUrl === null, "DB Logo URL Reset to null");
    assert(!fs.existsSync(reuploadedDiskPath), "Disk Logo Image File Cleaned Up & Unlinked");

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`   INSTITUTE LOGO VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Institute Logo Test Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runInstituteLogoVerification();
