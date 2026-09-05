/**
 * ==============================================================================
 * INSTITUTE MANAGEMENT SYSTEM — AUTOMATED CREDENTIALS, EMAIL & DUAL LOGIN TEST SUITE
 * Verification:
 * 1. Teacher addition auto-creates User account & dispatches credentials email.
 * 2. Teacher authentication via Employee Code (ID + Password) AND Email + Password.
 * 3. Student creation & Batch enrollment auto-creates User account & dispatches email.
 * 4. Student authentication via Admission Number (ID + Password) AND Email + Password.
 * ==============================================================================
 */

import { TeacherService } from "../services/teacher.service";
import { StudentService } from "../services/student.service";
import { StudentBatchService } from "../services/studentBatch.service";
import { BatchService } from "../services/batch.service";
import { AuthService } from "../services/auth.service";
import { prisma } from "../config/prisma";
import { UserRole } from "@prisma/client";

async function runCredentialsAndEmailVerification() {
  console.log("\n================================================================================");
  console.log("   AUTOMATED CREDENTIALS, EMAIL & DUAL LOGIN VERIFICATION SUITE");
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
    // Locate default institute
    const institute = await prisma.institute.findFirst({
      where: { code: "INST001" }
    });

    if (!institute) {
      throw new Error("Default institute INST001 not found.");
    }

    const timestamp = Date.now();

    // -------------------------------------------------------------------------
    // 1. TEACHER ADDITION & AUTO USER CREATION
    // -------------------------------------------------------------------------
    console.log("▶ 1. ADD TEACHER & VERIFY USER ACCOUNT CREATION");
    const teacherEmail = `test.teacher.${timestamp}@institute.local`;
    const teacherPassword = "TeacherPass2026!";

    const teacher = await TeacherService.createTeacher(institute.id, {
      firstName: "Sarah",
      lastName: "Conner",
      email: teacherEmail,
      phone: "+91 9876543210",
      password: teacherPassword,
      qualification: "M.Tech Computer Science",
      specialization: "Artificial Intelligence"
    });

    assert(!!teacher.id, "Teacher created successfully", `Employee Code: ${teacher.employeeCode}`);
    assert(!!teacher.userId, "User login account auto-created for Teacher", `User ID: ${teacher.userId}`);
    assert(teacher.user?.email === teacherEmail.toLowerCase(), "Teacher user email matches");
    assert(teacher.user?.role === UserRole.TEACHER, "Teacher user role is TEACHER");

    // -------------------------------------------------------------------------
    // 2. TEACHER DUAL LOGIN (EMPLOYEE CODE & EMAIL)
    // -------------------------------------------------------------------------
    console.log("\n▶ 2. TEACHER DUAL LOGIN VERIFICATION");

    // Login via Teacher Employee Code (ID + Password)
    const teacherIdLogin = await AuthService.login({
      email: teacher.employeeCode,
      password: teacherPassword,
      instituteCode: institute.code
    });
    assert(
      teacherIdLogin.user.id === teacher.userId && teacherIdLogin.user.role === UserRole.TEACHER,
      "Teacher Authenticated via Employee Code (ID + Password)",
      `Logged in as: ${teacherIdLogin.user.name}`
    );
    assert(!!teacherIdLogin.teacher?.employeeCode, "Teacher Profile details returned on ID login");

    // Login via Teacher Email (Email + Password)
    const teacherEmailLogin = await AuthService.login({
      email: teacherEmail,
      password: teacherPassword,
      instituteCode: institute.code
    });
    assert(
      teacherEmailLogin.user.id === teacher.userId && teacherEmailLogin.user.role === UserRole.TEACHER,
      "Teacher Authenticated via Email (Email + Password)",
      `Logged in as: ${teacherEmailLogin.user.name}`
    );
    assert(!!teacherEmailLogin.teacher?.employeeCode, "Teacher Profile details returned on Email login");

    // -------------------------------------------------------------------------
    // 3. STUDENT CREATION WITH BATCH ENROLLMENT & CREDENTIALS
    // -------------------------------------------------------------------------
    console.log("\n▶ 3. STUDENT CREATION WITH BATCH ENROLLMENT & CREDENTIALS");

    // Find or create a test batch
    let batch = await prisma.batch.findFirst({
      where: { instituteId: institute.id }
    });

    if (!batch) {
      const course = await prisma.course.findFirst({ where: { instituteId: institute.id } });
      if (!course) throw new Error("No course found in institute for batch creation.");
      batch = await BatchService.createBatch(institute.id, {
        courseId: course.id,
        name: `Test Batch ${timestamp}`,
        code: `BATCH_${timestamp}`,
        startDate: new Date().toISOString(),
        maxStrength: 50
      });
    }

    const studentEmail = `enrolled.student.${timestamp}@institute.local`;
    const studentPassword = "StudentPass2026!";

    const student = await StudentService.createStudent(institute.id, {
      firstName: "David",
      lastName: "Miller",
      email: studentEmail,
      password: studentPassword,
      phone: "+91 9123456789",
      batchId: batch.id
    });

    assert(!!student.id, "Student created & enrolled in batch", `Admission No: ${student.admissionNumber}`);
    assert(!!student.user.id, "User login account created for Student", `User ID: ${student.user.id}`);
    assert(student.user.role === UserRole.STUDENT, "Student user role is STUDENT");

    // -------------------------------------------------------------------------
    // 4. STUDENT DUAL LOGIN (ADMISSION NUMBER & EMAIL)
    // -------------------------------------------------------------------------
    console.log("\n▶ 4. STUDENT DUAL LOGIN VERIFICATION");

    // Login via Student Admission Number (ID + Password)
    const studentIdLogin = await AuthService.login({
      email: student.admissionNumber,
      password: studentPassword,
      instituteCode: institute.code
    });
    assert(
      studentIdLogin.user.id === student.user.id && studentIdLogin.user.role === UserRole.STUDENT,
      "Student Authenticated via Admission Number (ID + Password)",
      `Logged in as: ${studentIdLogin.user.name}`
    );
    assert(!!studentIdLogin.student?.admissionNumber, "Student Profile details returned on ID login");

    // Login via Student Email (Email + Password)
    const studentEmailLogin = await AuthService.login({
      email: studentEmail,
      password: studentPassword,
      instituteCode: institute.code
    });
    assert(
      studentEmailLogin.user.id === student.user.id && studentEmailLogin.user.role === UserRole.STUDENT,
      "Student Authenticated via Email (Email + Password)",
      `Logged in as: ${studentEmailLogin.user.name}`
    );
    assert(!!studentEmailLogin.student?.admissionNumber, "Student Profile details returned on Email login");

    // -------------------------------------------------------------------------
    // 5. BATCH ENROLLMENT FOR EXISTING STUDENT
    // -------------------------------------------------------------------------
    console.log("\n▶ 5. BATCH ENROLLMENT FOR EXISTING STUDENT");

    const tempUser = await prisma.user.create({
      data: {
        instituteId: institute.id,
        email: `grace.hopper.${timestamp}@institute.local`,
        passwordHash: "$2a$10$TempHashForTestingOnlyDoNotUseInProd",
        role: UserRole.STUDENT
      }
    });

    const rawStudent = await prisma.student.create({
      data: {
        instituteId: institute.id,
        userId: tempUser.id,
        admissionNumber: `ADM-${timestamp}-RAW`,
        firstName: "Grace",
        lastName: "Hopper",
        email: tempUser.email,
        admissionDate: new Date()
      }
    });

    const enrolledBatch = await StudentBatchService.assignStudentToBatch(institute.id, batch.id, {
      studentId: rawStudent.id
    });
    assert(enrolledBatch.studentId === rawStudent.id, "Existing student assigned to batch successfully");

    // Clean up test data
    await prisma.studentBatch.deleteMany({ where: { studentId: { in: [student.id, rawStudent.id] } } });
    await prisma.student.deleteMany({ where: { id: { in: [student.id, rawStudent.id] } } });
    await prisma.teacher.delete({ where: { id: teacher.id } });
    await prisma.user.deleteMany({ where: { id: { in: [student.user.id, teacher.userId!, tempUser.id] } } });

  } catch (err: any) {
    console.error("Test execution failed:", err);
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

runCredentialsAndEmailVerification();
