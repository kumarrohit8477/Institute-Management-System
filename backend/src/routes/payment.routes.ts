import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import {
  recordPaymentSchema,
  paymentQuerySchema
} from "../validations/payment.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Admin-only Payment recording
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(recordPaymentSchema),
  PaymentController.recordPayment
);

router.get(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(paymentQuerySchema),
  PaymentController.getPayments
);

router.get("/:id", PaymentController.getPaymentById);

export const paymentRoutes = router;
