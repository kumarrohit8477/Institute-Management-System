import { Router } from "express";
import { StudentController } from "../controllers/student.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import { enforceStudentQuota } from "../middleware/quota.middleware";
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema
} from "../validations/student.validation";
import { UserRole } from "@prisma/client";

const router = Router();

// All student management endpoints require authentication and tenant isolation
router.use(authenticate);
router.use(resolveTenantContext);

// Student Endpoint: Get My Academic Profile, Courses, Batches, Subjects, and Faculty
router.get("/my/academics", authorize(UserRole.STUDENT), StudentController.getMyAcademics);

// Admin-only operations
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createStudentSchema),
  enforceStudentQuota,
  StudentController.createStudent
);

router.get(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(studentQuerySchema),
  StudentController.getStudents
);

router.get("/:id", authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), StudentController.getStudentById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateStudentSchema),
  StudentController.updateStudent
);

export const studentRoutes = router;
