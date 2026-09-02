import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import {
  bulkAttendanceSchema,
  updateSingleAttendanceSchema,
  batchAttendanceQuerySchema
} from "../validations/attendance.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Student Endpoint: Personal Attendance Profile & History
router.get("/my", authorize(UserRole.STUDENT), AttendanceController.getMyAttendance);

// Admin Endpoints
router.post(
  "/bulk",
  authorize(UserRole.ADMIN),
  validateRequest(bulkAttendanceSchema),
  AttendanceController.markBulkAttendance
);

router.get(
  "/batch/:batchId",
  authorize(UserRole.ADMIN),
  validateRequest(batchAttendanceQuerySchema),
  AttendanceController.getBatchAttendance
);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateSingleAttendanceSchema),
  AttendanceController.updateAttendanceRecord
);

export const attendanceRoutes = router;
