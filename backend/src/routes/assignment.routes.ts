import { Router } from "express";
import { AssignmentController } from "../controllers/assignment.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { assignTeacherBatchSchema } from "../validations/assignment.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Assign teacher to batch + subject
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(assignTeacherBatchSchema),
  AssignmentController.assignTeacherBatch
);

// Delete teacher assignment
router.delete("/:assignmentId", authorize(UserRole.ADMIN), AssignmentController.removeAssignment);

export const assignmentRoutes = router;
