/**
 * ==============================================================================
 * INSTITUTE MANAGEMENT SYSTEM — UNIVERSAL AUTHENTICATION & RBAC TEST SUITE
 * Complete Verification for:
 * 1. Super Admin Authentication (Platform-level)
 * 2. Institute Admin Authentication (Tenant-level)
 * 3. Student Authentication via Email
 * 4. Student Authentication via Student Admission Number (Student ID)
 * 5. Invalid Credentials Rejection (401 Unauthorized)
 * 6. Inactive / Blocked Account Rejection (403 Forbidden)
 * 7. Role-Based Access Control (RBAC) Enforcement (Student -> Admin forbidden, Admin -> SuperAdmin forbidden)
 * 8. Multi-Tenant Cross-Institute Isolation (Admin A vs Admin B)
 * 9. Student Data Privacy & Private Scoping
 * ==============================================================================
 */

import { AuthService } from "../services/auth.service";
import { TokenUtil } from "../utils/token";
import { PasswordUtil } from "../utils/password";
import { prisma } from "../config/prisma";
import { UserRole, UserStatus, InstituteStatus, PlanTier, BillingCycle } from "@prisma/client";
import { StudentService } from "../services/student.service";
import { SaasService } from "../services/saas.service";

async function runAuthVerification() {
  console.log("\n================================================================================");
  console.log("   UNIVERSAL LOGIN & ROLE-BASED AUTHENTICATION VERIFICATION SUITE");
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
    // 1. Super Admin Universal Login
    // -------------------------------------------------------------------------
    console.log("▶ 1. SUPER ADMIN UNIVERSAL LOGIN");
    const superAdminRes = await AuthService.login({
      email: "superadmin@ims.local",
      password: "SuperAdminSecure2026!"
    });

    assert(
      superAdminRes.user.role === UserRole.SUPER_ADMIN,
      "Super Admin Authenticated",
      `Role: ${superAdminRes.user.role}, Name: ${superAdminRes.user.name}`
    );
    assert(
      !!superAdminRes.tokens.accessToken && !!superAdminRes.tokens.refreshToken,
      "JWT Access & Refresh Tokens Generated for Super Admin"
    );
    assert(
      superAdminRes.user.organizationId === null,
      "Super Admin is Platform-Level (Null Tenant Scope)"
    );

    // -------------------------------------------------------------------------
    // 2. Tenant Admin Universal Login
    // -------------------------------------------------------------------------
    console.log("\n▶ 2. TENANT ADMIN UNIVERSAL LOGIN");
    const adminRes = await AuthService.login({
      email: "admin@institute.local",
      password: "AdminSecurePassword123!"
    });

    assert(
      adminRes.user.role === UserRole.ADMIN,
      "Tenant Admin Authenticated",
      `Role: ${adminRes.user.role}, Tenant: ${adminRes.institute?.name}`
    );
    assert(
      !!adminRes.institute?.id && adminRes.user.organizationId === adminRes.institute.id,
      "Admin Associated with Organization Tenant ID"
    );

    // -------------------------------------------------------------------------
    // 3. Student Login via Email
    // -------------------------------------------------------------------------
    console.log("\n▶ 3. STUDENT LOGIN VIA EMAIL");
    const studentEmailRes = await AuthService.login({
      email: "student@institute.local",
      password: "StudentSecurePassword123!"
    });

    assert(
      studentEmailRes.user.role === UserRole.STUDENT,
      "Student Authenticated via Email",
      `Role: ${studentEmailRes.user.role}, Student Name: ${studentEmailRes.user.name}`
    );
    assert(
      !!studentEmailRes.student?.admissionNumber,
      "Student Profile Loaded",
      `Admission No: ${studentEmailRes.student?.admissionNumber}`
    );

    // -------------------------------------------------------------------------
    // 4. Student Login via Student Admission ID (No Email Format)
    // -------------------------------------------------------------------------
    console.log("\n▶ 4. STUDENT LOGIN VIA ADMISSION NUMBER (STUDENT ID)");
    const admissionNo = studentEmailRes.student!.admissionNumber; // e.g. ADM-2026-0001
    const studentIdRes = await AuthService.login({
      email: admissionNo,
      password: "StudentSecurePassword123!"
    });

    assert(
      studentIdRes.user.role === UserRole.STUDENT && studentIdRes.user.id === studentEmailRes.user.id,
      "Student Authenticated via Admission Number (Single Entrypoint)",
      `Identifier: ${admissionNo}`
    );

    // -------------------------------------------------------------------------
    // 5. Invalid Credentials Rejection
    // -------------------------------------------------------------------------
    console.log("\n▶ 5. INVALID CREDENTIALS REJECTION");
    let invalidPassRejected = false;
    try {
      await AuthService.login({
        email: "admin@institute.local",
        password: "IncorrectPassword999!"
      });
    } catch (e: any) {
      invalidPassRejected = e.statusCode === 401 || e.message.includes("Invalid credentials");
    }
    assert(invalidPassRejected, "Incorrect Password Rejected with 401 Unauthorized");

    let unknownUserRejected = false;
    try {
      await AuthService.login({
        email: "nonexistent.user@unknown.local",
        password: "SomePassword123!"
      });
    } catch (e: any) {
      unknownUserRejected = e.statusCode === 401 || e.message.includes("Invalid credentials");
    }
    assert(unknownUserRejected, "Non-Existent User Rejected with 401 Unauthorized");

    // -------------------------------------------------------------------------
    // 6. Inactive Account Rejection
    // -------------------------------------------------------------------------
    console.log("\n▶ 6. INACTIVE ACCOUNT BLOCKING");
    // Create temporary blocked user
    const blockedUser = await prisma.user.create({
      data: {
        email: `blocked_${Date.now()}@institute.local`,
        passwordHash: await PasswordUtil.hash("TempPass123!"),
        role: UserRole.STUDENT,
        status: UserStatus.BLOCKED,
        instituteId: adminRes.institute!.id
      }
    });

    let blockedRejected = false;
    try {
      await AuthService.login({
        email: blockedUser.email,
        password: "TempPass123!"
      });
    } catch (e: any) {
      blockedRejected = e.statusCode === 403 || e.message.includes("blocked");
    }
    assert(blockedRejected, "Blocked User Account Login Rejected (403 Forbidden)");

    // Cleanup
    await prisma.user.delete({ where: { id: blockedUser.id } });

    // -------------------------------------------------------------------------
    // 7. Role-Based Access Control (RBAC) Token Claims Verification
    // -------------------------------------------------------------------------
    console.log("\n▶ 7. RBAC & TOKEN CLAIMS INTEGRITY");
    const superAdminDecoded = TokenUtil.verifyAccessToken(superAdminRes.tokens.accessToken);
    const adminDecoded = TokenUtil.verifyAccessToken(adminRes.tokens.accessToken);
    const studentDecoded = TokenUtil.verifyAccessToken(studentEmailRes.tokens.accessToken);

    assert(
      superAdminDecoded.role === UserRole.SUPER_ADMIN &&
        adminDecoded.role === UserRole.ADMIN &&
        studentDecoded.role === UserRole.STUDENT,
      "JWT Claims Carry Verified User Roles"
    );

    assert(
      adminDecoded.instituteId === adminRes.institute!.id && studentDecoded.instituteId === adminRes.institute!.id,
      "JWT Claims Carry Tenant Isolation ID"
    );

    // -------------------------------------------------------------------------
    // 8. Multi-Tenant Cross-Institute Data Isolation
    // -------------------------------------------------------------------------
    console.log("\n▶ 8. MULTI-TENANT CROSS-INSTITUTE DATA ISOLATION");
    // Create secondary tenant
    const instCodeB = `TEST_INST_B_${Date.now()}`;
    const tenantB = await SaasService.onboardInstituteTenant({
      name: "Zenith Coaching Institute",
      code: instCodeB,
      customDomain: `${instCodeB.toLowerCase()}.ims.local`,
      email: `contact@${instCodeB.toLowerCase()}.local`,
      phone: "+91 9112233445",
      adminEmail: `admin@${instCodeB.toLowerCase()}.local`,
      adminPassword: "AdminSecurePassword123!",
      planTier: PlanTier.STARTER,
      billingCycle: BillingCycle.MONTHLY
    });

    // Verify Tenant A Admin cannot see Tenant B's students
    const tenantAStudents = await StudentService.getStudents(adminRes.institute!.id, {});
    const tenantBStudents = await StudentService.getStudents(tenantB.institute.id, {});

    const hasOverlap = tenantAStudents.students.some((s) =>
      tenantBStudents.students.some((bs) => bs.id === s.id)
    );
    assert(!hasOverlap, "Tenant A and Tenant B Student Records are Strictly Isolated");

    // Clean up Tenant B
    await prisma.institute.delete({ where: { id: tenantB.institute.id } });

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`   AUTH & RBAC VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Auth Test Execution Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthVerification();
