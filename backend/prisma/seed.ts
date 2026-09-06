import {
  PrismaClient,
  UserRole,
  UserStatus,
  PlanTier
} from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Clean Database Seeding (Platform Plans & Initial Super Admin Only)...");

  // ===========================================================================
  // 1. SaaS Subscription Plans (Tier Catalog)
  // ===========================================================================
  console.log("📦 Creating SaaS Subscription Plans...");

  await prisma.subscriptionPlan.upsert({
    where: { tier: PlanTier.FREE_TRIAL },
    update: {},
    create: {
      name: "Free Trial (14 Days)",
      tier: PlanTier.FREE_TRIAL,
      description: "14-day full access exploration plan for new institutes.",
      monthlyPrice: 0.0,
      annualPrice: 0.0,
      maxStudents: 30,
      maxCourses: 3,
      maxBatches: 5,
      maxStorageMB: 1024, // 1 GB
      hasOnlineCBT: true,
      hasCustomDomain: false,
      hasPushNotifications: false,
      hasApiAccess: false
    }
  });

  await prisma.subscriptionPlan.upsert({
    where: { tier: PlanTier.STARTER },
    update: {},
    create: {
      name: "Starter Academy Plan",
      tier: PlanTier.STARTER,
      description: "Ideal for boutique coaching centers and individual educators.",
      monthlyPrice: 2999.0,
      annualPrice: 29990.0,
      maxStudents: 150,
      maxCourses: 10,
      maxBatches: 20,
      maxStorageMB: 5120, // 5 GB
      hasOnlineCBT: true,
      hasCustomDomain: false,
      hasPushNotifications: true,
      hasApiAccess: false
    }
  });

  await prisma.subscriptionPlan.upsert({
    where: { tier: PlanTier.GROWTH },
    update: {},
    create: {
      name: "Growth Institute Plan",
      tier: PlanTier.GROWTH,
      description: "For expanding institutes requiring CBT exams & large batches.",
      monthlyPrice: 6999.0,
      annualPrice: 69990.0,
      maxStudents: 600,
      maxCourses: 30,
      maxBatches: 60,
      maxStorageMB: 25600, // 25 GB
      hasOnlineCBT: true,
      hasCustomDomain: true,
      hasPushNotifications: true,
      hasApiAccess: false
    }
  });

  await prisma.subscriptionPlan.upsert({
    where: { tier: PlanTier.ENTERPRISE },
    update: {},
    create: {
      name: "Enterprise Multi-Branch Plan",
      tier: PlanTier.ENTERPRISE,
      description: "Unlimited students, custom domain, dedicated SLA & API access.",
      monthlyPrice: 14999.0,
      annualPrice: 149990.0,
      maxStudents: 100000,
      maxCourses: 1000,
      maxBatches: 1000,
      maxStorageMB: 102400, // 100 GB
      hasOnlineCBT: true,
      hasCustomDomain: true,
      hasPushNotifications: true,
      hasApiAccess: true
    }
  });

  console.log(`✅ Subscription Plans seeded: FREE_TRIAL, STARTER, GROWTH, ENTERPRISE`);

  // ===========================================================================
  // 2. Global Platform Super Admin
  // ===========================================================================
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "superadmin@ims.local";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdminSecure2026!";
  const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: {
      instituteId_email: {
        instituteId: "",
        email: superAdminEmail
      }
    },
    update: {
      passwordHash: hashedSuperAdminPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE
    },
    create: {
      email: superAdminEmail,
      passwordHash: hashedSuperAdminPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  console.log(`🌐 Global Super Admin Account Ready: ${superAdmin.email} (Password: ${superAdminPassword})`);
  console.log("🌱 Clean Database Seeding Completed (No mock/default demo institutes created).");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
