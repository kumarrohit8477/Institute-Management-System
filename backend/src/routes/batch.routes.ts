import { Router } from "express";
import { BatchController } from "../controllers/batch.controller";
import { AssignmentController } from "../controllers/assignment.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import { enforceBatchQuota } from "../middleware/quota.middleware";
import {
  createBatchSchema,
  updateBatchSchema,
  batchQuerySchema,
  assignStudentBatchSchema,
  updateStudentBatchSchema
} from "../validations/batch.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(resolveTenantContext);

// --- BATCH CRUD ---
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createBatchSchema),
  enforceBatchQuota,
  BatchController.createBatch
);

router.get("/", validateRequest(batchQuerySchema), BatchController.getBatches);

router.get("/:id", BatchController.getBatchById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateBatchSchema),
  BatchController.updateBatch
);

// --- STUDENT BATCH ASSIGNMENTS ---
router.post(
  "/:batchId/students",
  authorize(UserRole.ADMIN),
  validateRequest(assignStudentBatchSchema),
  BatchController.assignStudent
);

router.get("/:batchId/students", BatchController.getBatchStudents);

router.patch(
  "/:batchId/students/:studentId",
  authorize(UserRole.ADMIN),
  validateRequest(updateStudentBatchSchema),
  BatchController.updateStudentBatch
);

router.delete(
  "/:batchId/students/:studentId",
  authorize(UserRole.ADMIN),
  BatchController.removeStudentFromBatch
);

// --- TEACHER BATCH ASSIGNMENTS ---
router.get("/:batchId/assignments", AssignmentController.getBatchAssignments);

export const batchRoutes = router;
