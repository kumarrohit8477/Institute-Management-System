import { Router } from "express";
import { InstituteController } from "../controllers/institute.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import { uploadLogoSchema, updateTaglineSchema, updateInstituteProfileSchema } from "../validations/institute.validation";
import { UserRole } from "@prisma/client";

const router = Router();

// All institute endpoints require authentication & tenant context
router.use(authenticate);
router.use(resolveTenantContext);

// Retrieve current institute branding and profile (accessible to all authenticated users of the institute)
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

// Manage institute tagline / slogan (restricted strictly to Admin and Super Admin)
router.put(
  "/tagline",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateTaglineSchema),
  InstituteController.updateTagline
);

router.patch(
  "/tagline",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateTaglineSchema),
  InstituteController.updateTagline
);

// Manage institute profile / details (restricted strictly to Admin and Super Admin)
router.put(
  "/profile",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateInstituteProfileSchema),
  InstituteController.updateProfile
);

router.patch(
  "/profile",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateInstituteProfileSchema),
  InstituteController.updateProfile
);

export const instituteRoutes = router;
