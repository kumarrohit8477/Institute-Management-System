import { prisma } from "../config/prisma";
import { PasswordUtil } from "../utils/password";
import { UserRole, UserStatus, InstituteStatus, StudentStatus } from "@prisma/client";

async function createDemoStudent() {
  console.log("==================================================");
  console.log(" 🎓 DEMO STUDENT ACCOUNT GENERATOR");
  console.log("==================================================");

  try {
    // 1. Ensure an Active Institute exists
    let institute = await prisma.institute.findFirst({
      where: { status: InstituteStatus.ACTIVE }
    });

    if (!institute) {
      console.log("🏛️  No active institute found. Creating Demo Institute...");
      institute = await prisma.institute.create({
        data: {
          name: "Apex Academy",
          code: "APEX01",
          email: "contact@apexacademy.edu",
          phone: "+91 9876543210",
          address: "123 Education Hub, Tech City",
          status: InstituteStatus.ACTIVE
        }
      });
      console.log(`✅ Created Institute: ${institute.name} (Code: ${institute.code})`);
    } else {
      console.log(`🏛️  Using existing Institute: ${institute.name} (Code: ${institute.code})`);
    }

    // 2. Ensure a Batch exists
    let batch = await prisma.batch.findFirst({
      where: { instituteId: institute.id }
    });

    if (!batch) {
      console.log("📚 Creating Demo Course & Batch...");
      const course = await prisma.course.create({
        data: {
          instituteId: institute.id,
          name: "Computer Science & Engineering",
          code: "CSE-101",
          description: "Core Computer Science Program"
        }
      });

      batch = await prisma.batch.create({
        data: {
          instituteId: institute.id,
          courseId: course.id,
          name: "2026 Alpha Batch",
          code: "BATCH-2026-A",
          startDate: new Date(),
          maxStrength: 50
        }
      });
      console.log(`✅ Created Batch: ${batch.name} (Code: ${batch.code})`);
    } else {
      console.log(`📚 Using existing Batch: ${batch.name}`);
    }

    // 3. Demo Student Credentials
    const demoEmail = "student.demo@example.com";
    const demoAdmissionNumber = "STU-DEMO-001";
    const demoPassword = "StudentDemo123!";

    // 4. Check if User already exists
    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: demoEmail },
          { student: { admissionNumber: demoAdmissionNumber } }
        ]
      },
      include: {
        student: true
      }
    });

    const passwordHash = await PasswordUtil.hash(demoPassword);

    if (existingUser) {
      console.log("🔄 Demo student account already exists. Resetting password...");
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          status: UserStatus.ACTIVE
        }
      });
    } else {
      console.log("👤 Creating Demo Student User & Profile...");
      const newUser = await prisma.user.create({
        data: {
          instituteId: institute.id,
          email: demoEmail,
          passwordHash,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE
        }
      });

      const newStudent = await prisma.student.create({
        data: {
          instituteId: institute.id,
          userId: newUser.id,
          admissionNumber: demoAdmissionNumber,
          firstName: "Demo",
          lastName: "Student",
          email: demoEmail,
          phone: "+91 9999988888",
          status: StudentStatus.ACTIVE,
          admissionDate: new Date()
        }
      });

      await prisma.studentBatch.create({
        data: {
          studentId: newStudent.id,
          batchId: batch.id,
          rollNumber: demoAdmissionNumber
        }
      });

      console.log("✅ Demo Student successfully created and enrolled!");
    }

    console.log("==================================================");
    console.log(" 🎉 DEMO STUDENT LOGIN CREDENTIALS READY");
    console.log("==================================================");
    console.log(` 🏢 Institute Code:    ${institute.code}`);
    console.log(` 🆔 Student ID:        ${demoAdmissionNumber}`);
    console.log(` 📧 Student Email:     ${demoEmail}`);
    console.log(` 🔑 Password:          ${demoPassword}`);
    console.log("--------------------------------------------------");
    console.log(" 🌐 WEB LOGIN:");
    console.log("    URL:               http://localhost:3000/login");
    console.log(`    Login Identifier:  ${demoAdmissionNumber} OR ${demoEmail}`);
    console.log(`    Password:          ${demoPassword}`);
    console.log(`    Institute Code:    ${institute.code}`);
    console.log("--------------------------------------------------");
    console.log(" 📱 MOBILE LOGIN:");
    console.log(`    Login Identifier:  ${demoAdmissionNumber} OR ${demoEmail}`);
    console.log(`    Password:          ${demoPassword}`);
    console.log("==================================================");

  } catch (error: any) {
    console.error("❌ Error generating demo student:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoStudent();
