import { prisma } from "../config/prisma";
import { TimeUtil } from "../utils/timeUtil";
import { TimetableService } from "../services/timetable.service";
import { StudentBatchService } from "../services/studentBatch.service";

async function runAcademicVerification() {
  console.log("===============================================================");
  console.log("  ACADEMIC MANAGEMENT & BATCH MANAGEMENT VERIFICATION SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // =========================================================================
  // TEST 1: TimeUtil Algorithms & Overlap Detection
  // =========================================================================
  console.log("--- 1. Testing Time Conflict Engine (TimeUtil) ---");

  // 1a: Back-to-back classes MUST NOT conflict (e.g. 10:00 - 11:30 and 11:30 - 13:00)
  const backToBackConflict = TimeUtil.overlaps("10:00", "11:30", "11:30", "13:00");
  assert(backToBackConflict === false, "Back-to-back classes (10:00-11:30 & 11:30-13:00) allowed with NO conflict");

  // 1b: Overlapping classes MUST conflict (e.g. 10:00 - 11:30 and 11:00 - 12:30)
  const overlappingConflict = TimeUtil.overlaps("10:00", "11:30", "11:00", "12:30");
  assert(overlappingConflict === true, "Overlapping classes (10:00-11:30 & 11:00-12:30) detected as CONFLICT");

  // 1c: Completely inside MUST conflict
  const insideConflict = TimeUtil.overlaps("09:00", "12:00", "10:00", "11:00");
  assert(insideConflict === true, "Nested class slot (09:00-12:00 & 10:00-11:00) detected as CONFLICT");

  // 1d: AM/PM normalization
  const ampmOverlap = TimeUtil.overlaps("09:00 AM", "10:30 AM", "10:30 AM", "12:00 PM");
  assert(ampmOverlap === false, "AM/PM back-to-back classes (9:00 AM-10:30 AM & 10:30 AM-12:00 PM) allowed with NO conflict");

  // =========================================================================
  // TEST 2: Multi-Tenant Institute & Academic Hierarchy
  // =========================================================================
  console.log("\n--- 2. Testing Database Academic Hierarchy ---");

  let institute = await prisma.institute.findFirst();
  if (!institute) {
    institute = await prisma.institute.create({
      data: {
        name: "Test Verification Academy",
        code: `VERIFY_${Date.now()}`,
        email: "verify@institute.local",
        phone: "+91 9999999999",
        status: "ACTIVE"
      }
    });
  }
  assert(!!institute, "Active institute found or created for verification");

  // 2a: Course: Full Stack Development (FSD)
  const course = await prisma.course.findFirst({
    where: { instituteId: institute.id, code: "FSD" },
    include: { courseSubjects: { include: { subject: true } } }
  });
  assert(!!course, "Course 'Full Stack Development' (FSD) exists");
  assert(course?.duration === 6 && course?.durationUnit === "MONTHS", "Course duration is 6 MONTHS");
  assert(Number(course?.totalFees) === 50000, "Course total fees is ₹50,000");
  assert(course?.courseSubjects.length === 5, "Course curriculum includes 5 CourseSubject links");

  // 2b: 5 Subjects
  const subjects = await prisma.subject.findMany({
    where: {
      instituteId: institute.id,
      code: { in: ["HTML-CSS", "JS", "REACT", "NODE", "DB"] }
    }
  });
  assert(subjects.length === 5, "All 5 core subjects exist (HTML-CSS, JS, REACT, NODE, DB)");

  // 2c: 3 Teachers with User Login Credentials
  const teachers = await prisma.teacher.findMany({
    where: {
      instituteId: institute.id,
      employeeCode: { in: ["FAC-2026-0010", "FAC-2026-0011", "FAC-2026-0012"] }
    },
    include: { user: true }
  });
  assert(teachers.length === 3, "All 3 faculty members exist (Amit Sharma, Priya Singh, Rahul Verma)");
  assert(
    teachers.every((t) => t.user !== null && t.user.role === "TEACHER"),
    "All 3 teachers have associated User login accounts with TEACHER role"
  );

  // 2d: Rooms
  const rooms = await prisma.room.findMany({
    where: {
      instituteId: institute.id,
      code: { in: ["R-101", "LAB-02"] }
    }
  });
  assert(rooms.length === 2, "Rooms R-101 (Classroom, 40) and LAB-02 (Lab, 30) exist");

  // =========================================================================
  // TEST 3: Batch Management as Central Academic Unit
  // =========================================================================
  console.log("\n--- 3. Testing Batch FSD-2026-A & Academic Bindings ---");

  const batch = await prisma.batch.findFirst({
    where: { instituteId: institute.id, code: "FSD-2026-A" },
    include: {
      batchSubjects: { include: { subject: true, assignedTeacher: true } },
      timetables: { include: { room: true, teacher: true } },
      students: true
    }
  });
  assert(!!batch, "Batch FSD-2026-A exists");
  assert(batch?.academicSession === "2026-2027", "Batch academic session is '2026-2027'");
  assert(batch?.maxStrength === 30, "Batch max capacity is 30 students");
  assert(batch?.batchSubjects.length === 5, "Batch has 5 active BatchSubjects connected");

  // Check teacher assignments at Batch Subject level
  const reactBatchSub = batch?.batchSubjects.find((bs) => bs.subject.code === "REACT");
  const nodeBatchSub = batch?.batchSubjects.find((bs) => bs.subject.code === "NODE");
  const dbBatchSub = batch?.batchSubjects.find((bs) => bs.subject.code === "DB");

  assert(
    reactBatchSub?.assignedTeacher?.employeeCode === "FAC-2026-0010",
    "React batch subject is assigned to Amit Sharma (FAC-2026-0010)"
  );
  assert(
    nodeBatchSub?.assignedTeacher?.employeeCode === "FAC-2026-0011",
    "Node.js batch subject is assigned to Priya Singh (FAC-2026-0011)"
  );
  assert(
    dbBatchSub?.assignedTeacher?.employeeCode === "FAC-2026-0012",
    "Database batch subject is assigned to Rahul Verma (FAC-2026-0012)"
  );

  // 3b: Timetable conflict check on back-to-back classes
  assert(batch?.timetables.length === 3, "Batch has 3 timetable slots configured");
  const monSlot1 = batch?.timetables.find((t) => t.dayOfWeek === "MONDAY" && t.startTime === "10:00");
  const monSlot2 = batch?.timetables.find((t) => t.dayOfWeek === "MONDAY" && t.startTime === "11:30");
  assert(
    !!monSlot1 && !!monSlot2 && monSlot1.endTime === "11:30" && monSlot2.startTime === "11:30",
    "Monday back-to-back classes (10:00-11:30 and 11:30-13:00) coexist cleanly in DB"
  );

  // =========================================================================
  // TEST 4: Backend Service Conflict & Capacity Exception Handlers
  // =========================================================================
  console.log("\n--- 4. Testing Service Conflict & Capacity Exceptions ---");

  // 4a: Test Teacher Schedule Conflict
  if (batch && reactBatchSub) {
    let conflictCaught = false;
    try {
      await TimetableService.createTimetable(institute.id, {
        batchId: batch.id,
        subjectId: reactBatchSub.subjectId,
        teacherId: reactBatchSub.assignedTeacherId!, // Amit Sharma
        dayOfWeek: "MONDAY",
        startTime: "10:30", // Clashes with 10:00 - 11:30!
        endTime: "12:00",
        classType: "OFFLINE",
        status: "ACTIVE"
      });
    } catch (err: any) {
      conflictCaught = true;
      assert(
        err.message.includes("already assigned to another class during this time"),
        `Teacher conflict error verified: '${err.message}'`
      );
    }
    assert(conflictCaught, "TimetableService rejects clashing teacher schedule slot");
  }

  // 4b: Test Batch Seating Capacity Error
  if (batch) {
    // Create a mock batch with maxStrength = 1 to test capacity error
    const testBatch = await prisma.batch.create({
      data: {
        instituteId: institute.id,
        courseId: course!.id,
        name: "Test Capacity Batch",
        code: `CAP-TEST-${Date.now()}`,
        maxStrength: 1,
        startDate: new Date()
      }
    });

    // Create 2 test student records with user accounts
    const testUser1 = await prisma.user.create({
      data: {
        instituteId: institute.id,
        email: `testuser1-${Date.now()}@example.com`,
        passwordHash: "hash123",
        role: "STUDENT"
      }
    });

    const testStudent1 = await prisma.student.create({
      data: {
        instituteId: institute.id,
        userId: testUser1.id,
        admissionNumber: `TEST-ADM-1-${Date.now()}`,
        firstName: "Test",
        lastName: "One",
        email: testUser1.email
      }
    });

    const testUser2 = await prisma.user.create({
      data: {
        instituteId: institute.id,
        email: `testuser2-${Date.now()}@example.com`,
        passwordHash: "hash123",
        role: "STUDENT"
      }
    });

    const testStudent2 = await prisma.student.create({
      data: {
        instituteId: institute.id,
        userId: testUser2.id,
        admissionNumber: `TEST-ADM-2-${Date.now()}`,
        firstName: "Test",
        lastName: "Two",
        email: testUser2.email
      }
    });

    // Enroll student 1 -> succeeds
    await StudentBatchService.assignStudentToBatch(institute.id, testBatch.id, {
      studentId: testStudent1.id
    });

    // Enroll student 2 -> MUST throw "Batch capacity has been reached."
    let capacityErrorCaught = false;
    try {
      await StudentBatchService.assignStudentToBatch(institute.id, testBatch.id, {
        studentId: testStudent2.id
      });
    } catch (err: any) {
      capacityErrorCaught = true;
      assert(
        err.message === "Batch capacity has been reached.",
        `Exact capacity error verified: '${err.message}'`
      );
    }
    assert(capacityErrorCaught, "StudentBatchService enforces exact batch capacity limit");

    // Cleanup test records
    await prisma.studentBatch.deleteMany({ where: { batchId: testBatch.id } });
    await prisma.batch.delete({ where: { id: testBatch.id } });
    await prisma.student.deleteMany({ where: { id: { in: [testStudent1.id, testStudent2.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testUser1.id, testUser2.id] } } });
  }

  console.log("\n===============================================================");
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runAcademicVerification().catch((err) => {
  console.error("Verification suite encountered unexpected failure:", err);
  process.exit(1);
});
