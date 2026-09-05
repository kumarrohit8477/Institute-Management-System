import crypto from "crypto";
import { prisma } from "../config/prisma";
import { config } from "../config/env";
import { PasswordUtil } from "../utils/password";
import { UserRole, UserStatus } from "@prisma/client";

interface OneTimeSetupPayload {
  email: string;
  temporaryPassword: string;
  setupToken: string;
  createdAt: number;
}

export class BootstrapService {
  private static oneTimeSetupPayload: OneTimeSetupPayload | null = null;

  /**
   * Generates a cryptographically secure random password meeting strict complexity standards.
   */
  public static generateSecurePassword(length = 16): string {
    const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowers = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%^&*()_+-=";

    const guaranteed = [
      uppers[crypto.randomInt(0, uppers.length)],
      lowers[crypto.randomInt(0, lowers.length)],
      numbers[crypto.randomInt(0, numbers.length)],
      symbols[crypto.randomInt(0, symbols.length)]
    ];

    const allChars = uppers + lowers + numbers + symbols;
    const chars = [...guaranteed];

    for (let i = 0; i < length - guaranteed.length; i++) {
      chars.push(allChars[crypto.randomInt(0, allChars.length)]);
    }

    for (let i = chars.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join("");
  }

  /**
   * Checks whether a Super Admin exists in the system.
   * If none exists, creates the initial Super Admin account with a secure temporary password.
   */
  public static async checkAndBootstrapSuperAdmin() {
    try {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: UserRole.SUPER_ADMIN }
      });

      if (existingSuperAdmin) {
        console.log(`[BOOTSTRAP] Super Admin account exists (${existingSuperAdmin.email}). Skipped initial creation.`);
        return { exists: true, newlyCreated: false };
      }

      const superAdminEmail = (config.superAdminEmail || "superadmin@ims.local").trim().toLowerCase();
      const temporaryPassword = this.generateSecurePassword(16);
      const hashedPassword = await PasswordUtil.hash(temporaryPassword);
      const setupToken = crypto.randomBytes(24).toString("hex");

      await prisma.user.create({
        data: {
          email: superAdminEmail,
          passwordHash: hashedPassword,
          role: UserRole.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          mustChangePassword: true,
          instituteId: null
        }
      });

      this.oneTimeSetupPayload = {
        email: superAdminEmail,
        temporaryPassword,
        setupToken,
        createdAt: Date.now()
      };

      console.log(`[BOOTSTRAP] Initial Super Admin account created successfully for: ${superAdminEmail}`);
      console.log(`[BOOTSTRAP] One-time temporary password generated and available for initial setup retrieval.`);

      return {
        exists: true,
        newlyCreated: true,
        email: superAdminEmail
      };
    } catch (error) {
      console.error("[BOOTSTRAP ERROR] Failed during Super Admin initialization:", error);
      throw error;
    }
  }

  /**
   * Returns current bootstrap status for public status checks.
   */
  public static async getBootstrapStatus() {
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: UserRole.SUPER_ADMIN }
    });

    return {
      exists: !!existingSuperAdmin,
      hasUnclaimedCredentials: !!this.oneTimeSetupPayload,
      email: existingSuperAdmin ? existingSuperAdmin.email : this.oneTimeSetupPayload?.email || null
    };
  }

  /**
   * Securely claims the one-time temporary password.
   * Purges the plain-text password from memory immediately after invocation.
   */
  public static claimOneTimeSetup() {
    if (!this.oneTimeSetupPayload) {
      return {
        exists: true,
        newlyCreated: false,
        temporaryPassword: null,
        message: "No unclaimed temporary setup password is available. Access credentials have already been retrieved or claimed."
      };
    }

    const payloadCopy = {
      exists: true,
      newlyCreated: true,
      email: this.oneTimeSetupPayload.email,
      temporaryPassword: this.oneTimeSetupPayload.temporaryPassword,
      message: "Initial Super Admin account created successfully. Store this temporary password safely. It will NOT be shown again."
    };

    // Purge plain-text temporary password from memory immediately
    this.oneTimeSetupPayload = null;

    return payloadCopy;
  }
}
