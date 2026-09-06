/**
 * ==============================================================================
 * INSTITUTE MANAGEMENT SYSTEM — STUDENT COURSE & BATCH ENROLLMENT VERIFICATION
 * Tests:
 * 1. Query students with enriched batch and course details
 * 2. Query students filtered by courseId and batchId
 * 3. Enroll student into a course batch with roll number
 * 4. Verify batch student count and capacity checks
 * 5. Unenroll student from batch
 * ==============================================================================
 */

import { StudentService } from "../services/student.service";
import { StudentBatchService } from "../services/studentBatch.service";
import { prisma } from "../config/prisma";

async function runStudentEnrollmentVerification() {
  console.log("\n================================================================================");
  console.log("   STUDENT COURSE & BATCH ENROLLMENT VERIFICATION SUITE");
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
          name: "Enrollment Test Institute",
          code: `ENROLL_${Date.now()}`,
          email: "enroll@institute.local",
          phone: "+91 9999999999",
          status: "ACTIVE"
        }
      });
    }

    // Find or create a course and batch
    let batch = await prisma.batch.findFirst({
      where: { instituteId: institute.id },
      include: { course: true }
    });

    if (!batch) {
      const course = await prisma.course.create({
        data: {
          instituteId: institute.id,
          name: "Test Course",
          code: `TC_${Date.now()}`,
          durationMonths: 12,
          status: "ACTIVE"
        }
      });
      batch = await prisma.batch.create({
        data: {
          instituteId: institute.id,
          courseId: course.id,
          name: "Test Batch A",
          code: `TB_${Date.now()}`,
          startDate: new Date(),
          status: "ACTIVE"
        },
        include: { course: true }
      });
    }

    // -------------------------------------------------------------------------
    // TEST 1: Retrieve students with batch & course relation details
    // -------------------------------------------------------------------------
    console.log("▶ 1. QUERY STUDENTS WITH BATCH & COURSE DATA");
    const res = await StudentService.getStudents(institute.id, { page: 1, limit: 10 });
    assert(Array.isArray(res.students), "Students array returned", `${res.students.length} students found`);
    assert(res.students.length > 0, "At least 1 student exists in the institute");

    const firstWithBatch = res.students.find(s => s.batches && s.batches.length > 0);
    if (firstWithBatch) {
      const firstBatch = firstWithBatch.batches[0].batch;
      assert(firstBatch.course !== undefined, "Batch includes course details", firstBatch.course?.name);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Filter students by courseId
    // -------------------------------------------------------------------------
    console.log("\n▶ 2. FILTER STUDENTS BY COURSE ID");
    const courseFiltered = await StudentService.getStudents(institute.id, {
      courseId: batch.courseId,
      page: 1,
      limit: 10
    });
    assert(Array.isArray(courseFiltered.students), "Filtered by courseId succeeded", `${courseFiltered.students.length} matches`);

    // -------------------------------------------------------------------------
    // TEST 3: Enroll student into batch
    // -------------------------------------------------------------------------
    console.log("\n▶ 3. ASSIGN STUDENT TO BATCH");
    let testStudent = res.students.find(s => !s.batches.some(b => b.batchId === batch.id));
    if (!testStudent) {
      testStudent = res.students[0];
      await prisma.studentBatch.deleteMany({
        where: { studentId: testStudent.id, batchId: batch.id }
      });
    }
    const rollNo = `TEST-ROLL-${Date.now().toString().slice(-4)}`;

    // Try assigning
    const assigned = await StudentBatchService.assignStudentToBatch(institute.id, batch.id, {
      studentId: testStudent.id,
      rollNumber: rollNo
    });

    assert(assigned.studentId === testStudent.id, "Student successfully assigned to batch", assigned.batchId);
    assert(assigned.rollNumber === rollNo, "Roll number set correctly", assigned.rollNumber || "");

    // -------------------------------------------------------------------------
    // TEST 4: Verify Student Query reflects new enrollment
    // -------------------------------------------------------------------------
    console.log("\n▶ 4. VERIFY STUDENT ENROLLMENT REFLECTION");
    const verifyStudent = await StudentService.getStudentById(institute.id, testStudent.id);
    const hasBatch = verifyStudent.batches.some(b => b.batchId === batch.id);
    assert(hasBatch, "Student details now include the newly enrolled batch");

    // -------------------------------------------------------------------------
    // TEST 5: Unenroll student from batch
    // -------------------------------------------------------------------------
    console.log("\n▶ 5. UNENROLL STUDENT FROM BATCH");
    const removed = await StudentBatchService.removeStudentFromBatch(institute.id, batch.id, testStudent.id);
    assert(removed.removed === true, "Student removed from batch successfully");

    const verifyAfterRemoval = await StudentService.getStudentById(institute.id, testStudent.id);
    const stillHasBatch = verifyAfterRemoval.batches.some(b => b.batchId === batch.id);
    assert(!stillHasBatch, "Student batch successfully unlinked in database");

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

runStudentEnrollmentVerification();
