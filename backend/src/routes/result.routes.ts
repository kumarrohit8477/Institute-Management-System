import { Router } from "express";
import { ResultController } from "../controllers/result.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(resolveTenantContext);

// Student results history
router.get("/my", authorize(UserRole.STUDENT), ResultController.getMyResults);

export const resultRoutes = router;
