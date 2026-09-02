import { Router } from "express";
import { healthRoutes } from "./health.routes";
import { authRoutes } from "./auth.routes";
import { studentRoutes } from "./student.routes";
import { teacherRoutes } from "./teacher.routes";
import { courseRoutes } from "./course.routes";
import { subjectRoutes } from "./subject.routes";
import { batchRoutes } from "./batch.routes";
import { assignmentRoutes } from "./assignment.routes";
import { timetableRoutes } from "./timetable.routes";
import { materialRoutes } from "./material.routes";
import { attendanceRoutes } from "./attendance.routes";
import { questionRoutes } from "./question.routes";
import { testRoutes } from "./test.routes";
import { resultRoutes } from "./result.routes";
import { feeRoutes } from "./fee.routes";
import { paymentRoutes } from "./payment.routes";
import { notificationRoutes } from "./notification.routes";
import { saasRoutes } from "./saas.routes";
import { instituteRoutes } from "./institute.routes";

const router = Router();

// Routes registry
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/institute", instituteRoutes);
router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/courses", courseRoutes);
router.use("/subjects", subjectRoutes);
router.use("/batches", batchRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/timetable", timetableRoutes);
router.use("/materials", materialRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/questions", questionRoutes);
router.use("/tests", testRoutes);
router.use("/results", resultRoutes);
router.use("/fees", feeRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/saas", saasRoutes);

export const apiRouter = router;
