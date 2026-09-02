import { Router } from "express";
import { SaasController } from "../controllers/saas.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import {
  createInstituteTenantSchema,
  updateInstituteTenantSchema,
  updateTenantStatusSchema,
  changeTenantSubscriptionSchema,
  updatePlanPricingSchema,
  saasQuerySchema
} from "../validations/saas.validation";
import { UserRole } from "@prisma/client";

const router = Router();

// All SaaS management endpoints strictly require SUPER_ADMIN authorization
router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN));

// Platform Overview Analytics
router.get("/overview", SaasController.getPlatformOverview);

// Institute Tenant Management
router.post(
  "/institutes",
  validateRequest(createInstituteTenantSchema),
  SaasController.onboardInstitute
);

router.get(
  "/institutes",
  validateRequest(saasQuerySchema),
  SaasController.getAllInstitutes
);

router.get("/institutes/:id", SaasController.getInstituteById);

router.patch(
  "/institutes/:id",
  validateRequest(updateInstituteTenantSchema),
  SaasController.updateInstitute
);

router.patch(
  "/institutes/:id/status",
  validateRequest(updateTenantStatusSchema),
  SaasController.updateInstituteStatus
);

router.post(
  "/institutes/:id/subscription",
  validateRequest(changeTenantSubscriptionSchema),
  SaasController.changeInstituteSubscription
);

// Subscription Plan Catalog Management
router.get("/plans", SaasController.getSubscriptionPlans);

router.patch(
  "/plans/:id",
  validateRequest(updatePlanPricingSchema),
  SaasController.updateSubscriptionPlan
);

// B2B Platform Invoices & Billing
router.get("/invoices", SaasController.getPlatformInvoices);
router.post("/invoices/:id/pay", SaasController.recordInvoicePayment);

export const saasRoutes = router;
