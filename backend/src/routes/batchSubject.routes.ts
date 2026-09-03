import { Router } from "express";
import { BatchSubjectController } from "../controllers/batchSubject.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import {
  addBatchSubjectSchema,
  updateBatchSubjectSchema,
  assignBatchSubjectTeacherSchema
} from "../validations/batchSubject.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(resolveTenantContext);

// Batch-specific subject listing & addition
router.post(
  "/batches/:batchId/subjects",
  authorize(UserRole.ADMIN),
  validateRequest(addBatchSubjectSchema),
  BatchSubjectController.addSubjectToBatch
);

router.get(
  "/batches/:batchId/subjects",
  BatchSubjectController.getBatchSubjects
);

// Batch subject direct management
router.patch(
  "/batch-subjects/:id",
  authorize(UserRole.ADMIN, UserRole.TEACHER),
  validateRequest(updateBatchSubjectSchema),
  BatchSubjectController.updateBatchSubject
);

router.post(
  "/batch-subjects/:id/assign-teacher",
  authorize(UserRole.ADMIN),
  validateRequest(assignBatchSubjectTeacherSchema),
  BatchSubjectController.assignTeacher
);

router.delete(
  "/batch-subjects/:id",
  authorize(UserRole.ADMIN),
  BatchSubjectController.removeBatchSubject
);

export const batchSubjectRoutes = router;
