import { Router } from "express";
import { MaterialController } from "../controllers/material.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import {
  createMaterialSchema,
  updateMaterialSchema,
  materialQuerySchema
} from "../validations/material.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Student Endpoint: Personalized Enrolled Materials
router.get("/my", authorize(UserRole.STUDENT), MaterialController.getMyMaterials);

// Admin Endpoints
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createMaterialSchema),
  MaterialController.createMaterial
);

router.get("/", validateRequest(materialQuerySchema), MaterialController.getMaterials);

router.get("/:id", MaterialController.getMaterialById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateMaterialSchema),
  MaterialController.updateMaterial
);

router.delete("/:id", authorize(UserRole.ADMIN), MaterialController.deleteMaterial);

export const materialRoutes = router;
