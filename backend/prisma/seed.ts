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

  // ===========================================================================
  // 8. Academic Hierarchy: Full Stack Development (FSD) Course, Subjects, Teachers, Rooms, Batch
  // ===========================================================================
  console.log("🏫 Seeding Complete Academic Management System Data (FSD Course)...");

  // 8a. Course: Full Stack Development
  const fsdCourse = await prisma.course.upsert({
    where: {
      instituteId_code: {
        instituteId: institute.id,
        code: "FSD"
      }
    },
    update: {
      duration: 6,
      durationUnit: "MONTHS",
      durationMonths: 6,
      totalFees: 50000.0
    },
    create: {
      instituteId: institute.id,
      name: "Full Stack Development",
      code: "FSD",
      description: "Master modern web development from frontend to backend and databases.",
      duration: 6,
      durationUnit: "MONTHS",
      durationMonths: 6,
      totalFees: 50000.0,
      status: CourseStatus.ACTIVE
    }
  });

  // 8b. 5 Core Subjects
  const subjectsData = [
    { name: "HTML & CSS", code: "HTML-CSS", desc: "Modern HTML5 semantics, CSS3 Flexbox, Grid, and responsive layout design." },
    { name: "JavaScript", code: "JS", desc: "ES6+, asynchronous programming, DOM manipulation, and modern web APIs." },
    { name: "React", code: "REACT", desc: "Component architecture, hooks, state management, and modern SPA development." },
    { name: "Node.js", code: "NODE", desc: "Backend runtime, Express.js REST APIs, authentication, and microservices." },
    { name: "Database", code: "DB", desc: "Relational modeling, MySQL, PostgreSQL, Prisma ORM, and query optimization." }
  ];

  const createdSubjects = [];
  for (let i = 0; i < subjectsData.length; i++) {
    const sub = subjectsData[i];
    const createdSub = await prisma.subject.upsert({
      where: {
        courseId_code: {
          courseId: fsdCourse.id,
          code: sub.code
        }
      },
      update: { name: sub.name, description: sub.desc },
      create: {
        instituteId: institute.id,
        courseId: fsdCourse.id,
        name: sub.name,
        code: sub.code,
        description: sub.desc,
        status: SubjectStatus.ACTIVE
      }
    });

    // Link in CourseSubject curriculum
    await prisma.courseSubject.upsert({
      where: {
        courseId_subjectId: {
          courseId: fsdCourse.id,
          subjectId: createdSub.id
        }
      },
      update: { displayOrder: i + 1 },
      create: {
        courseId: fsdCourse.id,
        subjectId: createdSub.id,
        displayOrder: i + 1,
        estimatedDuration: "4-6 Weeks"
      }
    });

    createdSubjects.push(createdSub);
  }

  // 8c. 3 Teachers with Login Credentials (Password: Teacher@123)
  const teacherPasswordHash = await bcrypt.hash("Teacher@123", 10);

  const teachersData = [
    {
      firstName: "Amit",
      lastName: "Sharma",
      email: "amit.sharma@apexacademy.local",
      phone: "+91 9811002233",
      employeeCode: "FAC-2026-0010",
      qualification: "M.Tech in Computer Science",
      specialization: "Frontend & UI Engineering",
      skills: "HTML, CSS, JavaScript, React, Tailwind CSS",
      experienceYears: 7.0,
      subjectIndices: [0, 1, 2] // HTML-CSS, JS, React
    },
    {
      firstName: "Priya",
      lastName: "Singh",
      email: "priya.singh@apexacademy.local",
      phone: "+91 9822003344",
      employeeCode: "FAC-2026-0011",
      qualification: "Ph.D. in Computer Science",
      specialization: "Backend Systems & Cloud Architecture",
      skills: "Node.js, Express, TypeScript, Microservices, Docker",
      experienceYears: 9.5,
      subjectIndices: [3] // Node.js
    },
    {
      firstName: "Rahul",
      lastName: "Verma",
      email: "rahul.verma@apexacademy.local",
      phone: "+91 9833004455",
      employeeCode: "FAC-2026-0012",
      qualification: "MCA, B.Sc Computer Science",
      specialization: "Database Systems & Data Modeling",
      skills: "MySQL, PostgreSQL, MongoDB, Redis, Prisma ORM",
      experienceYears: 6.0,
      subjectIndices: [4] // Database
    }
  ];

  const createdTeachers = [];
  for (const td of teachersData) {
    // Create Login User
    const teacherUser = await prisma.user.upsert({
      where: {
        instituteId_email: {
          instituteId: institute.id,
          email: td.email.toLowerCase()
        }
      },
      update: {
        passwordHash: teacherPasswordHash,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE
      },
      create: {
        instituteId: institute.id,
        email: td.email.toLowerCase(),
        passwordHash: teacherPasswordHash,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE
      }
    });

    const teacher = await prisma.teacher.upsert({
      where: {
        instituteId_employeeCode: {
          instituteId: institute.id,
          employeeCode: td.employeeCode
        }
      },
      update: {
        userId: teacherUser.id,
        skills: td.skills,
        specialization: td.specialization,
        qualification: td.qualification
      },
      create: {
        instituteId: institute.id,
        userId: teacherUser.id,
        employeeCode: td.employeeCode,
        firstName: td.firstName,
        lastName: td.lastName,
        email: td.email.toLowerCase(),
        phone: td.phone,
        gender: Gender.MALE,
        qualification: td.qualification,
        specialization: td.specialization,
        experienceYears: td.experienceYears,
        skills: td.skills,
        status: TeacherStatus.ACTIVE
      }
    });

    // Link qualifications
    for (const idx of td.subjectIndices) {
      await prisma.teacherSubject.upsert({
        where: {
          teacherId_subjectId: {
            teacherId: teacher.id,
            subjectId: createdSubjects[idx].id
          }
        },
        update: {},
        create: {
          teacherId: teacher.id,
          subjectId: createdSubjects[idx].id
        }
      });
    }

    createdTeachers.push(teacher);
  }

  // 8d. Classrooms / Rooms
  const room101 = await prisma.room.upsert({
    where: {
      instituteId_code: {
        instituteId: institute.id,
        code: "R-101"
      }
    },
    update: { capacity: 40 },
    create: {
      instituteId: institute.id,
      name: "Room 101 - Smart Classroom",
      code: "R-101",
      capacity: 40,
      type: "CLASSROOM",
      status: "ACTIVE"
    }
  });

  const lab02 = await prisma.room.upsert({
    where: {
      instituteId_code: {
        instituteId: institute.id,
        code: "LAB-02"
      }
    },
    update: { capacity: 30 },
    create: {
      instituteId: institute.id,
      name: "Lab 2 - Systems & Coding",
      code: "LAB-02",
      capacity: 30,
      type: "LAB",
      status: "ACTIVE"
    }
  });

  // 8e. Batch: FSD-2026-A
  const fsdBatch = await prisma.batch.upsert({
    where: {
      instituteId_code: {
        instituteId: institute.id,
        code: "FSD-2026-A"
      }
    },
    update: {
      academicSession: "2026-2027",
      maxStrength: 30,
      description: "Premier morning cohort for Full Stack Web Development."
    },
    create: {
      instituteId: institute.id,
      courseId: fsdCourse.id,
      name: "Full Stack Development - Batch A",
      code: "FSD-2026-A",
      academicSession: "2026-2027",
      description: "Premier morning cohort for Full Stack Web Development.",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-10-01"),
      maxStrength: 30,
      status: BatchStatus.ACTIVE
    }
  });

  // 8f. Batch Subjects with Teacher Assignments & Progress
  // HTML & CSS -> Amit Sharma (100% completed)
  await prisma.batchSubject.upsert({
    where: {
      batchId_subjectId: {
        batchId: fsdBatch.id,
        subjectId: createdSubjects[0].id
      }
    },
    update: { assignedTeacherId: createdTeachers[0].id, progress: 100, status: "COMPLETED" },
    create: {
      batchId: fsdBatch.id,
      subjectId: createdSubjects[0].id,
      assignedTeacherId: createdTeachers[0].id,
      status: "COMPLETED",
      progress: 100,
      notes: "Completed all CSS Flexbox and Grid hands-on projects."
    }
  });

  // JavaScript -> Amit Sharma (80% in progress)
  await prisma.batchSubject.upsert({
    where: {
      batchId_subjectId: {
        batchId: fsdBatch.id,
        subjectId: createdSubjects[1].id
      }
    },
    update: { assignedTeacherId: createdTeachers[0].id, progress: 80, status: "IN_PROGRESS" },
    create: {
      batchId: fsdBatch.id,
      subjectId: createdSubjects[1].id,
      assignedTeacherId: createdTeachers[0].id,
      status: "IN_PROGRESS",
      progress: 80,
      notes: "Async/await and Fetch API completed. Moving to DOM events."
    }
  });

  // React -> Amit Sharma (40% in progress)
  const reactBatchSub = await prisma.batchSubject.upsert({
    where: {
      batchId_subjectId: {
        batchId: fsdBatch.id,
        subjectId: createdSubjects[2].id
      }
    },
    update: { assignedTeacherId: createdTeachers[0].id, progress: 40, status: "IN_PROGRESS" },
    create: {
      batchId: fsdBatch.id,
      subjectId: createdSubjects[2].id,
      assignedTeacherId: createdTeachers[0].id,
      status: "IN_PROGRESS",
      progress: 40,
      notes: "Hooks and state management in progress."
    }
  });

  // Node.js -> Priya Singh (Not started)
  const nodeBatchSub = await prisma.batchSubject.upsert({
    where: {
      batchId_subjectId: {
        batchId: fsdBatch.id,
        subjectId: createdSubjects[3].id
      }
    },
    update: { assignedTeacherId: createdTeachers[1].id, progress: 0, status: "NOT_STARTED" },
    create: {
      batchId: fsdBatch.id,
      subjectId: createdSubjects[3].id,
      assignedTeacherId: createdTeachers[1].id,
      status: "NOT_STARTED",
      progress: 0
    }
  });

  // Database -> Rahul Verma (Not started)
  const dbBatchSub = await prisma.batchSubject.upsert({
    where: {
      batchId_subjectId: {
        batchId: fsdBatch.id,
        subjectId: createdSubjects[4].id
      }
    },
    update: { assignedTeacherId: createdTeachers[2].id, progress: 0, status: "NOT_STARTED" },
    create: {
      batchId: fsdBatch.id,
      subjectId: createdSubjects[4].id,
      assignedTeacherId: createdTeachers[2].id,
      status: "NOT_STARTED",
      progress: 0
    }
  });

  // 8g. Timetable Schedules:
  // Monday 10:00 - 11:30: React with Amit Sharma in Room 101
  const existingSlot1 = await prisma.timetable.findFirst({
    where: {
      batchId: fsdBatch.id,
      dayOfWeek: "MONDAY",
      startTime: "10:00"
    }
  });
  if (!existingSlot1) {
    await prisma.timetable.create({
      data: {
        instituteId: institute.id,
        batchId: fsdBatch.id,
        subjectId: createdSubjects[2].id, // React
        teacherId: createdTeachers[0].id, // Amit
        roomId: room101.id,
        batchSubjectId: reactBatchSub.id,
        dayOfWeek: "MONDAY",
        startTime: "10:00",
        endTime: "11:30",
        roomNumber: "R-101",
        classType: "OFFLINE",
        status: "ACTIVE"
      }
    });
  }

  // Monday 11:30 - 13:00: Node.js with Priya Singh in Lab 2 (valid back-to-back class!)
  const existingSlot2 = await prisma.timetable.findFirst({
    where: {
      batchId: fsdBatch.id,
      dayOfWeek: "MONDAY",
      startTime: "11:30"
    }
  });
  if (!existingSlot2) {
    await prisma.timetable.create({
      data: {
        instituteId: institute.id,
        batchId: fsdBatch.id,
        subjectId: createdSubjects[3].id, // Node.js
        teacherId: createdTeachers[1].id, // Priya
        roomId: lab02.id,
        batchSubjectId: nodeBatchSub.id,
        dayOfWeek: "MONDAY",
        startTime: "11:30",
        endTime: "13:00",
        roomNumber: "LAB-02",
        classType: "OFFLINE",
        status: "ACTIVE"
      }
    });
  }

  // Tuesday 10:00 - 11:30: Database with Rahul Verma in Lab 2
  const existingSlot3 = await prisma.timetable.findFirst({
    where: {
      batchId: fsdBatch.id,
      dayOfWeek: "TUESDAY",
      startTime: "10:00"
    }
  });
  if (!existingSlot3) {
    await prisma.timetable.create({
      data: {
        instituteId: institute.id,
        batchId: fsdBatch.id,
        subjectId: createdSubjects[4].id, // Database
        teacherId: createdTeachers[2].id, // Rahul
        roomId: lab02.id,
        batchSubjectId: dbBatchSub.id,
        dayOfWeek: "TUESDAY",
        startTime: "10:00",
        endTime: "11:30",
        roomNumber: "LAB-02",
        classType: "OFFLINE",
        status: "ACTIVE"
      }
    });
  }

  // 8h. Enroll Student into FSD Batch
  await prisma.studentBatch.upsert({
    where: {
      studentId_batchId: {
        studentId: studentProfile.id,
        batchId: fsdBatch.id
      }
    },
    update: {},
    create: {
      studentId: studentProfile.id,
      batchId: fsdBatch.id,
      rollNumber: "FSD-001",
      status: StudentBatchStatus.ACTIVE
    }
  });

  console.log(`✅ FSD Course, 5 Subjects, 3 Teachers, Rooms, Batch FSD-2026-A & Timetable seeded successfully!`);
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
