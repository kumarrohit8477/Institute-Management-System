import { Router } from "express";
import { FeeController } from "../controllers/fee.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import {
  createFeeSchema,
  updateFeeSchema,
  feeQuerySchema
} from "../validations/fee.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Student Endpoint: Personalized Fee Summary & Ledger
router.get("/my", authorize(UserRole.STUDENT), FeeController.getMyFeeOverview);

// Admin-only Invoicing Endpoints
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createFeeSchema),
  FeeController.createFee
);

router.get(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(feeQuerySchema),
  FeeController.getFees
);

router.get("/:id", FeeController.getFeeById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateFeeSchema),
  FeeController.updateFee
);

router.delete("/:id", authorize(UserRole.ADMIN), FeeController.deleteFee);

export const feeRoutes = router;
