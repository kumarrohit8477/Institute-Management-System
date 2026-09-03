import { Router } from "express";
import { TeacherPortalController } from "../controllers/teacherPortal.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(resolveTenantContext);
router.use(authorize(UserRole.TEACHER, UserRole.ADMIN));

router.get("/academic-scope", TeacherPortalController.getMyAcademicScope);
router.patch("/batch-subjects/:id", TeacherPortalController.updateMyBatchSubject);

export const teacherPortalRoutes = router;
