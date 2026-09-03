import { Router } from "express";
import { CourseSubjectController } from "../controllers/courseSubject.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import {
  addCourseSubjectSchema,
  updateCourseSubjectSchema,
  deleteCourseSubjectSchema
} from "../validations/courseSubject.validation";
import { UserRole } from "@prisma/client";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(resolveTenantContext);

router.post(
  "/:courseId/subjects",
  authorize(UserRole.ADMIN),
  validateRequest(addCourseSubjectSchema),
  CourseSubjectController.addSubjectToCourse
);

router.get(
  "/:courseId/subjects",
  CourseSubjectController.getCourseSubjects
);

router.patch(
  "/:courseId/subjects/:subjectId",
  authorize(UserRole.ADMIN),
  validateRequest(updateCourseSubjectSchema),
  CourseSubjectController.updateCourseSubject
);

router.delete(
  "/:courseId/subjects/:subjectId",
  authorize(UserRole.ADMIN),
  validateRequest(deleteCourseSubjectSchema),
  CourseSubjectController.removeSubjectFromCourse
);

export const courseSubjectRoutes = router;
