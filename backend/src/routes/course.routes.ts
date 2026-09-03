import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import { enforceCourseQuota } from "../middleware/quota.middleware";
import { createCourseSchema, updateCourseSchema, courseQuerySchema } from "../validations/course.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(resolveTenantContext);

router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createCourseSchema),
  enforceCourseQuota,
  CourseController.createCourse
);

router.get("/", validateRequest(courseQuerySchema), CourseController.getCourses);

router.get("/:id", CourseController.getCourseById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateCourseSchema),
  CourseController.updateCourse
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  CourseController.deleteCourse
);

import { courseSubjectRoutes } from "./courseSubject.routes";
router.use("/", courseSubjectRoutes);

export const courseRoutes = router;
