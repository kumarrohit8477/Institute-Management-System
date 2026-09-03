import { Router } from "express";
import { TeacherController } from "../controllers/teacher.controller";
import { AssignmentController } from "../controllers/assignment.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import {
  createTeacherSchema,
  updateTeacherSchema,
  teacherQuerySchema
} from "../validations/teacher.validation";
import { assignTeacherSubjectSchema } from "../validations/assignment.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(resolveTenantContext);

// Admin-only teacher endpoints
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createTeacherSchema),
  TeacherController.createTeacher
);

router.get(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(teacherQuerySchema),
  TeacherController.getTeachers
);

router.get("/:id", TeacherController.getTeacherById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateTeacherSchema),
  TeacherController.updateTeacher
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  TeacherController.deleteTeacher
);

// Teacher Subject Qualifications
router.post(
  "/:teacherId/subjects",
  authorize(UserRole.ADMIN),
  validateRequest(assignTeacherSubjectSchema),
  AssignmentController.assignTeacherSubject
);

router.get("/:teacherId/subjects", AssignmentController.getTeacherSubjects);

router.delete(
  "/:teacherId/subjects/:subjectId",
  authorize(UserRole.ADMIN),
  AssignmentController.removeTeacherSubject
);

export const teacherRoutes = router;
