import { z } from "zod";
import { InstituteStatus, PlanTier, BillingCycle } from "@prisma/client";

export const createInstituteTenantSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Institute name is required" }).min(2),
    code: z
      .string({ required_error: "Institute code is required" })
      .min(2)
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens and underscores"),
    customDomain: z.string().optional().nullable(),
    email: z.string({ required_error: "Institute email is required" }).email(),
    phone: z.string({ required_error: "Contact phone is required" }).min(6),
    address: z.string().optional().nullable(),
    tagline: z.string().max(255).optional().nullable(),
    adminEmail: z.string({ required_error: "Admin email is required" }).email(),
    adminPassword: z.string({ required_error: "Admin password is required" }).min(6),
    planTier: z.nativeEnum(PlanTier).default(PlanTier.STARTER),
    billingCycle: z.nativeEnum(BillingCycle).default(BillingCycle.MONTHLY)
  })
});

export const updateInstituteTenantSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Institute ID is required" })
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    customDomain: z.string().optional().nullable(),
    phone: z.string().min(6).optional(),
    address: z.string().optional().nullable(),
    status: z.nativeEnum(InstituteStatus).optional(),
    logoUrl: z.string().optional().nullable(),
    tagline: z.string().max(255).optional().nullable()
  })
});

export const updateTenantStatusSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Institute ID is required" })
  }),
  body: z.object({
    status: z.nativeEnum(InstituteStatus, { required_error: "Institute status is required" })
  })
});

export const changeTenantSubscriptionSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Institute ID is required" })
  }),
  body: z.object({
    planTier: z.nativeEnum(PlanTier, { required_error: "Plan tier is required" }),
    billingCycle: z.nativeEnum(BillingCycle).default(BillingCycle.MONTHLY),
    autoRenew: z.boolean().default(true)
  })
});

export const updatePlanPricingSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Plan ID is required" })
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    monthlyPrice: z.coerce.number().min(0).optional(),
    annualPrice: z.coerce.number().min(0).optional(),
    maxStudents: z.coerce.number().positive().optional(),
    maxCourses: z.coerce.number().positive().optional(),
    maxBatches: z.coerce.number().positive().optional(),
    maxStorageMB: z.coerce.number().positive().optional(),
    hasOnlineCBT: z.boolean().optional(),
    hasCustomDomain: z.boolean().optional(),
    hasPushNotifications: z.boolean().optional(),
    hasApiAccess: z.boolean().optional(),
    isActive: z.boolean().optional()
  })
});

export const saasQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(InstituteStatus).optional(),
    planTier: z.nativeEnum(PlanTier).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateInstituteTenantInput = z.infer<typeof createInstituteTenantSchema>["body"];
export type UpdateInstituteTenantInput = z.infer<typeof updateInstituteTenantSchema>["body"];
export type ChangeTenantSubscriptionInput = z.infer<typeof changeTenantSubscriptionSchema>["body"];
export type UpdatePlanPricingInput = z.infer<typeof updatePlanPricingSchema>["body"];
export type SaasQueryParams = {
  status?: InstituteStatus;
  planTier?: PlanTier;
  search?: string;
  page?: number;
  limit?: number;
};
