import { Router } from "express";
import { InstituteController } from "../controllers/institute.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import { uploadLogoSchema } from "../validations/institute.validation";
import { UserRole } from "@prisma/client";

const router = Router();

// All institute endpoints require authentication & tenant context
router.use(authenticate);
router.use(resolveTenantContext);

// Retrieve current institute branding (accessible to all authenticated users of the institute)
router.get("/current", InstituteController.getCurrentInstitute);

// Manage institute logo (restricted strictly to Admin and Super Admin)
router.post(
  "/logo",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(uploadLogoSchema),
  InstituteController.uploadLogo
);

router.delete(
  "/logo",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  InstituteController.deleteLogo
);

export const instituteRoutes = router;
