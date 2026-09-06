import { BootstrapService } from "../services/bootstrap.service";
import { AuthService } from "../services/auth.service";
import { prisma } from "../config/prisma";
import crypto from "crypto";

async function runSuperAdminTestSuite() {
  console.log("=== 🚀 STARTING SUPER ADMIN AUTH & BOOTSTRAP TEST SUITE ===");

  try {
    // Reset test environment: delete existing SUPER_ADMIN user to test clean initial bootstrap
    await prisma.user.deleteMany({ where: { role: "SUPER_ADMIN" } });

    // -------------------------------------------------------------------------
    // TEST 1: Bootstrap Check & Initial Creation
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Testing Super Admin Bootstrap Check...");
    const initialStatus = await BootstrapService.getBootstrapStatus();
    console.log("Initial status before test:", initialStatus);

    const bootstrapResult = await BootstrapService.checkAndBootstrapSuperAdmin();
    console.log("Bootstrap execution result:", bootstrapResult);

    const claimedPayload = BootstrapService.claimOneTimeSetup();
    console.log("Claimed payload (First Time):", {
      exists: claimedPayload.exists,
      newlyCreated: claimedPayload.newlyCreated,
      email: "email" in claimedPayload ? claimedPayload.email : undefined,
      hasTemporaryPassword: !!claimedPayload.temporaryPassword,
      message: claimedPayload.message
    });

    if (!claimedPayload.temporaryPassword && !initialStatus.exists) {
      throw new Error("FAIL: Expected temporary password on initial bootstrap!");
    }

    const tempPassword = claimedPayload.temporaryPassword;

    // -------------------------------------------------------------------------
    // TEST 2: Re-claiming or Server Restart Check (Single-use Protection)
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Testing Single-Use & Re-start Protection...");
    const secondClaimPayload = BootstrapService.claimOneTimeSetup();
    console.log("Claimed payload (Second Time):", secondClaimPayload);

    if (secondClaimPayload.temporaryPassword) {
      throw new Error("FAIL: Temporary password was returned twice! Single-use rule violated.");
    }

    const secondBootstrapCheck = await BootstrapService.checkAndBootstrapSuperAdmin();
    console.log("Second Bootstrap Check (Server restart simulation):", secondBootstrapCheck);

    if (secondBootstrapCheck.newlyCreated) {
      throw new Error("FAIL: Created duplicate Super Admin on second run!");
    }

    // -------------------------------------------------------------------------
    // TEST 3: Login with Bootstrapped Credentials
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Testing Login with Bootstrapped Credentials...");

    // Find Super Admin email
    const superAdminUser = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" }
    });

    if (!superAdminUser) {
      throw new Error("FAIL: Super Admin user record not found in DB.");
    }

    let activePassword = tempPassword;

    // If super admin already existed from seed, use seeded password for testing if tempPassword is null
    if (!tempPassword) {
      console.log("Using seeded superadmin email & password for test continuation...");
      activePassword = "SuperAdminSecure2026!";
    }

    const loginResult = await AuthService.login({
      email: superAdminUser.email,
      password: activePassword!
    });

    console.log("Login Success! Logged in user:", {
      id: loginResult.user.id,
      email: loginResult.user.email,
      role: loginResult.user.role,
      mustChangePassword: loginResult.user.mustChangePassword
    });

    // -------------------------------------------------------------------------
    // TEST 4: Password Change Flow
    // -------------------------------------------------------------------------
    console.log("\n[TEST 4] Testing Super Admin Password Change...");
    const newPassword = "NewSuperAdminPass2026!";

    const changePwdResult = await AuthService.changePassword(superAdminUser.id, {
      currentPassword: activePassword!,
      newPassword,
      confirmPassword: newPassword
    });

    console.log("Change Password Result:", changePwdResult);

    // Verify login with new password
    const loginWithNewPwd = await AuthService.login({
      email: superAdminUser.email,
      password: newPassword
    });

    console.log("Login with NEW password success! mustChangePassword:", loginWithNewPwd.user.mustChangePassword);

    if (loginWithNewPwd.user.mustChangePassword !== false) {
      throw new Error("FAIL: mustChangePassword was not reset to false after password change.");
    }

    // Verify old password no longer works
    let oldPwdFailed = false;
    try {
      await AuthService.login({
        email: superAdminUser.email,
        password: activePassword!
      });
    } catch {
      oldPwdFailed = true;
    }

    if (!oldPwdFailed) {
      throw new Error("FAIL: Old password still worked after changing password!");
    }
    console.log("✅ Verified old password is invalid after change.");

    // -------------------------------------------------------------------------
    // TEST 5: Forgot Password & Email Token Reset Flow
    // -------------------------------------------------------------------------
    console.log("\n[TEST 5] Testing Forgot Password & Reset Token Flow...");
    const forgotPwdResult = await AuthService.forgotPassword({
      email: superAdminUser.email
    });
    console.log("Forgot Password API Result:", forgotPwdResult);

    // Retrieve generated token from DB
    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: { userId: superAdminUser.id, usedAt: null },
      orderBy: { createdAt: "desc" }
    });

    if (!resetTokenRecord) {
      throw new Error("FAIL: Password reset token record was not created in DB.");
    }

    console.log("Reset token created in DB with expiresAt:", resetTokenRecord.expiresAt);

    // To test token reset API, we simulate raw token hash match by creating a known raw token
    const testRawToken = crypto.randomBytes(32).toString("hex");
    const testTokenHash = crypto.createHash("sha256").update(testRawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: superAdminUser.id,
        tokenHash: testTokenHash,
        expiresAt: new Date(Date.now() + 3600000)
      }
    });

    const resetPasswordTo = "ResetSuperAdminPass2026!";

    const resetPwdResult = await AuthService.resetPassword({
      token: testRawToken,
      newPassword: resetPasswordTo,
      confirmPassword: resetPasswordTo
    });

    console.log("Reset Password API Result:", resetPwdResult);

    // Verify login with reset password
    const loginWithResetPwd = await AuthService.login({
      email: superAdminUser.email,
      password: resetPasswordTo
    });

    console.log("Login with RESET password success! User:", loginWithResetPwd.user.email);

    // Verify token single-use rule (re-using testRawToken must fail)
    let reuseFailed = false;
    try {
      await AuthService.resetPassword({
        token: testRawToken,
        newPassword: "AnotherPassword123!",
        confirmPassword: "AnotherPassword123!"
      });
    } catch {
      reuseFailed = true;
    }

    if (!reuseFailed) {
      throw new Error("FAIL: Reset token was allowed to be reused!");
    }
    console.log("✅ Verified reset token cannot be reused after single use.");

    console.log("\n=== 🎉 ALL SUPER ADMIN SECURITY & AUTH TESTS PASSED SUCCESSFULLY! ===");
  } catch (err: any) {
    console.error("\n❌ TEST SUITE FAILED:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSuperAdminTestSuite();
