import {
  PrismaClient,
  UserRole,
  UserStatus,
  InstituteStatus,
  StudentStatus,
  TeacherStatus,
  CourseStatus,
  SubjectStatus,
  BatchStatus,
  StudentBatchStatus,
  Gender,
  PlanTier,
  SubscriptionStatus,
  BillingCycle
} from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Comprehensive Multi-Tenant SaaS Database Seeding...");

  // ===========================================================================
  // 0. SaaS Subscription Plans (Tier Catalog)
  // ===========================================================================
  console.log("📦 Creating SaaS Subscription Plans...");

  const trialPlan = await prisma.subscriptionPlan.upsert({
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

  const starterPlan = await prisma.subscriptionPlan.upsert({
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

  const growthPlan = await prisma.subscriptionPlan.upsert({
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

  const enterprisePlan = await prisma.subscriptionPlan.upsert({
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

  console.log(`✅ Subscription Plans seeded: TRIAL, STARTER (₹2,999/m), GROWTH (₹6,999/m), ENTERPRISE (₹14,999/m)`);

  // ===========================================================================
  // 1. Global Platform Super Admin
  // ===========================================================================
  const superAdminEmail = "superadmin@ims.local";
  const superAdminPassword = "SuperAdminSecure2026!";
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

  console.log(`🌐 Global Super Admin: ${superAdmin.email} (Password: ${superAdminPassword})`);

  // ===========================================================================
  // 2. Default Demo Institute (Tenant)
  // ===========================================================================
  const instituteCode = process.env.DEFAULT_INSTITUTE_CODE || "INST001";
  const instituteName = process.env.DEFAULT_INSTITUTE_NAME || "Apex Academy Campus";

  const institute = await prisma.institute.upsert({
    where: { code: instituteCode },
    update: {
      name: instituteName,
      email: "contact@apexacademy.local",
      phone: "+91 9876543210",
      status: InstituteStatus.ACTIVE
    },
    create: {
      name: instituteName,
      code: instituteCode,
      customDomain: "apex.ims.local",
      email: "contact@apexacademy.local",
      phone: "+91 9876543210",
      address: "123 Knowledge Park, Silicon Hub, Bangalore, Karnataka 560100",
      website: "https://apexacademy.local",
      status: InstituteStatus.ACTIVE,
      settings: {
        currency: "INR",
        timezone: "Asia/Kolkata",
        academicYear: "2026-2027"
      }
    }
  });

  console.log(`✅ Institute Tenant ready: ${institute.name} (Code: ${institute.code})`);

  // ===========================================================================
  // 3. Attach Active Subscription & Tenant Usage to Institute
  // ===========================================================================
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  await prisma.subscription.upsert({
    where: { instituteId: institute.id },
    update: {
      planId: growthPlan.id,
      status: SubscriptionStatus.ACTIVE,
      endDate
    },
    create: {
      instituteId: institute.id,
      planId: growthPlan.id,
      billingCycle: BillingCycle.ANNUAL,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
      autoRenew: true
    }
  });

  await prisma.tenantUsage.upsert({
    where: { instituteId: institute.id },
    update: {
      studentCount: 1,
      courseCount: 2,
      batchCount: 2,
      storageUsedMB: 120.5,
      testsCreatedThisMonth: 1
    },
    create: {
      instituteId: institute.id,
      studentCount: 1,
      courseCount: 2,
      batchCount: 2,
      storageUsedMB: 120.5,
      testsCreatedThisMonth: 1
    }
  });

  console.log(`💳 Tenant Subscription Linked: GROWTH Plan (Active until ${endDate.toLocaleDateString()})`);

  // ===========================================================================
  // 4. Institute Admin User
  // ===========================================================================
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@institute.local";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "AdminSecurePassword123!";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: {
      instituteId_email: {
        instituteId: institute.id,
        email: adminEmail
      }
    },
    update: {
      passwordHash: hashedAdminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    },
    create: {
      instituteId: institute.id,
      email: adminEmail,
      passwordHash: hashedAdminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  console.log(`👑 Tenant Admin User: ${admin.email} (Password: ${adminPassword})`);

  // ===========================================================================
  // 5. Courses & Subjects & Batches
  // ===========================================================================
  const jeeCourse = await prisma.course.upsert({
    where: {
      instituteId_code: {
        instituteId: institute.id,
        code: "JEE-2027"
      }
    },
    update: {},
    create: {
      instituteId: institute.id,
      name: "IIT-JEE 2-Year Advanced Program",
      code: "JEE-2027",
      description: "Intensive 2-year preparation for JEE Main and JEE Advanced examinations.",
      durationMonths: 24,
      status: CourseStatus.ACTIVE
    }
  });

  const neetCourse = await prisma.course.upsert({
    where: {
      instituteId_code: {
        instituteId: institute.id,
        code: "NEET-2027"
      }
    },
    update: {},
    create: {
      instituteId: institute.id,
      name: "NEET Medical Entrance Program",
      code: "NEET-2027",
      description: "Comprehensive medical entrance program covering Physics, Chemistry, and Biology.",
      durationMonths: 24,
      status: CourseStatus.ACTIVE
    }
  });

  const physicsSubject = await prisma.subject.upsert({
    where: {
      courseId_code: {
        courseId: jeeCourse.id,
        code: "PHY-JEE"
      }
    },
    update: {},
    create: {
      instituteId: institute.id,
      courseId: jeeCourse.id,
      name: "Physics (Mechanics, Electrodynamics & Optics)",
      code: "PHY-JEE",
      description: "Advanced physics concepts for engineering entrance",
      status: SubjectStatus.ACTIVE
    }
  });

  const mathsSubject = await prisma.subject.upsert({
    where: {
      courseId_code: {
        courseId: jeeCourse.id,
        code: "MATH-JEE"
      }
    },
    update: {},
    create: {
      instituteId: institute.id,
      courseId: jeeCourse.id,
      name: "Mathematics (Calculus & Algebra)",
      code: "MATH-JEE",
      description: "Advanced calculus, vectors, 3D geometry and coordinate algebra",
      status: SubjectStatus.ACTIVE
    }
  });

  const morningBatch = await prisma.batch.upsert({
    where: {
      instituteId_code: {
        instituteId: institute.id,
        code: "BATCH-JEE-M1"
      }
    },
    update: {},
    create: {
      instituteId: institute.id,
      courseId: jeeCourse.id,
      name: "JEE Morning Star Batch",
      code: "BATCH-JEE-M1",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2028-03-31"),
      maxStrength: 50,
      status: BatchStatus.ACTIVE
    }
  });

  // ===========================================================================
  // 6. Faculty (Teachers)
  // ===========================================================================
  const physicsTeacher = await prisma.teacher.upsert({
    where: {
      instituteId_employeeCode: {
        instituteId: institute.id,
        employeeCode: "FAC-2026-0001"
      }
    },
    update: {},
    create: {
      instituteId: institute.id,
      employeeCode: "FAC-2026-0001",
      firstName: "Harish",
      lastName: "Verma",
      email: "hverma.physics@apexacademy.local",
      phone: "+91 9845012345",
      gender: Gender.MALE,
      qualification: "Ph.D. in Applied Physics, IIT Kanpur",
      specialization: "Quantum Mechanics & Classical Dynamics",
      experienceYears: 14.5,
      address: "Faculty Quarters A-1, Apex Campus",
      status: TeacherStatus.ACTIVE
    }
  });

  await prisma.teacherSubject.upsert({
    where: {
      teacherId_subjectId: {
        teacherId: physicsTeacher.id,
        subjectId: physicsSubject.id
      }
    },
    update: {},
    create: {
      teacherId: physicsTeacher.id,
      subjectId: physicsSubject.id
    }
  });

  await prisma.teacherAssignment.upsert({
    where: {
      teacherId_batchId_subjectId: {
        teacherId: physicsTeacher.id,
        batchId: morningBatch.id,
        subjectId: physicsSubject.id
      }
    },
    update: {},
    create: {
      instituteId: institute.id,
      teacherId: physicsTeacher.id,
      courseId: jeeCourse.id,
      subjectId: physicsSubject.id,
      batchId: morningBatch.id
    }
  });

  // ===========================================================================
  // 7. Student Credentials & Enrollment
  // ===========================================================================
  const studentEmail = "student@institute.local";
  const studentPassword = "StudentSecurePassword123!";
  const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);

  const studentUser = await prisma.user.upsert({
    where: {
      instituteId_email: {
        instituteId: institute.id,
        email: studentEmail
      }
    },
    update: {
      passwordHash: hashedStudentPassword,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE
    },
    create: {
      instituteId: institute.id,
      email: studentEmail,
      passwordHash: hashedStudentPassword,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE
    }
  });

  const studentProfile = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {
      firstName: "Rohit",
      lastName: "Kumar",
      phone: "+91 9123456780",
      status: StudentStatus.ACTIVE
    },
    create: {
      instituteId: institute.id,
      userId: studentUser.id,
      admissionNumber: "ADM-2026-0001",
      firstName: "Rohit",
      lastName: "Kumar",
      email: studentEmail,
      phone: "+91 9123456780",
      dateOfBirth: new Date("2006-05-14"),
      gender: Gender.MALE,
      address: "101 Lotus Enclave, Indiranagar, Bangalore",
      guardianName: "Rajesh Kumar",
      guardianPhone: "+91 9876501234",
      guardianEmail: "rajesh.kumar@parent.local",
      status: StudentStatus.ACTIVE,
      admissionDate: new Date("2026-03-01")
    }
  });

  await prisma.studentBatch.upsert({
    where: {
      studentId_batchId: {
        studentId: studentProfile.id,
        batchId: morningBatch.id
      }
    },
    update: {},
    create: {
      studentId: studentProfile.id,
      batchId: morningBatch.id,
      rollNumber: "JEE-M1-01",
      status: StudentBatchStatus.ACTIVE
    }
  });

  console.log(`🎓 Student Enrolled: ${studentProfile.firstName} ${studentProfile.lastName} (Batch: ${morningBatch.code})`);
  console.log("🌱 Multi-Tenant SaaS Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
