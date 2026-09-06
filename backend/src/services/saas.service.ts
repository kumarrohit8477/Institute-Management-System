import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { PasswordUtil } from "../utils/password";
import { HTTP_STATUS } from "../common";
import { PlanTier } from "../types";
import {
  InstituteStatus,
  SubscriptionStatus,
  InvoiceStatus,
  UserRole,
  UserStatus,
  BillingCycle,
  Prisma
} from "@prisma/client";
import {
  CreateInstituteTenantInput,
  UpdateInstituteTenantInput,
  ChangeTenantSubscriptionInput,
  UpdatePlanPricingInput,
  SaasQueryParams
} from "../validations/saas.validation";

export class SaasService {
  /**
   * Super Admin Dashboard Platform-Wide Analytics
   */
  static async getPlatformOverview() {
    const [
      totalInstitutes,
      activeTenants,
      trialTenants,
      suspendedTenants,
      totalStudents,
      totalCourses,
      totalUsers,
      allSubscriptions,
      allInvoices,
      recentInstitutes,
      recentInvoices
    ] = await Promise.all([
      prisma.institute.count(),
      prisma.institute.count({ where: { status: InstituteStatus.ACTIVE } }),
      prisma.institute.count({ where: { status: InstituteStatus.TRIAL } }),
      prisma.institute.count({ where: { status: InstituteStatus.SUSPENDED } }),
      prisma.student.count(),
      prisma.course.count(),
      prisma.user.count(),
      prisma.subscription.findMany({
        where: { status: SubscriptionStatus.ACTIVE },
        include: { plan: true }
      }),
      prisma.platformInvoice.findMany({
        where: { status: InvoiceStatus.PAID },
        select: { totalAmount: true }
      }),
      prisma.institute.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          subscription: { include: { plan: true } },
          tenantUsage: true
        }
      }),
      prisma.platformInvoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          institute: { select: { id: true, name: true, code: true } }
        }
      })
    ]);

    // Calculate Monthly Recurring Revenue (MRR) & Total Lifetime Revenue
    let mrr = 0;
    for (const sub of allSubscriptions) {
      if (sub.billingCycle === BillingCycle.MONTHLY) {
        mrr += Number(sub.plan.monthlyPrice);
      } else if (sub.billingCycle === BillingCycle.ANNUAL) {
        mrr += Number(sub.plan.annualPrice) / 12;
      }
    }

    const totalRevenue = allInvoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);

    return {
      kpis: {
        totalInstitutes,
        activeTenants,
        trialTenants,
        suspendedTenants,
        totalStudents,
        totalCourses,
        totalUsers,
        monthlyRecurringRevenue: Math.round(mrr),
        annualRecurringRevenue: Math.round(mrr * 12),
        totalLifetimeRevenue: Math.round(totalRevenue)
      },
      recentInstitutes,
      recentInvoices
    };
  }

  /**
   * Onboard a new Institute Tenant with Admin User & Initial Subscription
   */
  static async onboardInstituteTenant(input: CreateInstituteTenantInput) {
    const {
      name,
      code,
      customDomain,
      email,
      phone,
      address,
      adminEmail,
      adminPassword,
      planTier,
      billingCycle = BillingCycle.MONTHLY
    } = input;

    // Check code uniqueness
    const existingInstitute = await prisma.institute.findFirst({
      where: {
        OR: [{ code: code.toUpperCase() }, ...(customDomain ? [{ customDomain }] : [])]
      }
    });

    if (existingInstitute) {
      throw new AppError(
        `An institute with code '${code}' or domain '${customDomain}' already exists`,
        HTTP_STATUS.CONFLICT
      );
    }

    // Locate chosen plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { tier: planTier }
    });

    if (!plan) {
      throw new AppError(`Subscription plan tier '${planTier}' not found`, HTTP_STATUS.NOT_FOUND);
    }

    const hashedPassword = await PasswordUtil.hash(adminPassword);

    // Calculate subscription period
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === BillingCycle.ANNUAL) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const price = billingCycle === BillingCycle.ANNUAL ? Number(plan.annualPrice) : Number(plan.monthlyPrice);
    const taxAmount = Number((price * 0.18).toFixed(2)); // 18% GST standard
    const totalAmount = price + taxAmount;

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Generate invoice number inside transaction to prevent race conditions
      const invoiceCount = await tx.platformInvoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, "0")}`;

      // 1. Create Institute
      const institute = await tx.institute.create({
        data: {
          name,
          code: code.toUpperCase(),
          customDomain: customDomain || null,
          email,
          phone,
          address: address || null,
          tagline: (input as any).tagline || null,
          status: planTier === PlanTier.FREE_TRIAL ? InstituteStatus.TRIAL : InstituteStatus.ACTIVE,
          settings: {
            currency: "INR",
            timezone: "Asia/Kolkata",
            academicYear: "2026-2027"
          }
        }
      });

      // 2. Create Admin User
      const adminUser = await tx.user.create({
        data: {
          instituteId: institute.id,
          email: adminEmail.toLowerCase(),
          passwordHash: hashedPassword,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE
        }
      });

      // 3. Create Subscription
      const subscription = await tx.subscription.create({
        data: {
          instituteId: institute.id,
          planId: plan.id,
          billingCycle,
          status: planTier === PlanTier.FREE_TRIAL ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          trialEndsAt: planTier === PlanTier.FREE_TRIAL ? new Date(Date.now() + 14 * 86400000) : null,
          autoRenew: true
        }
      });

      // 4. Initialize Tenant Usage Tracker
      const usage = await tx.tenantUsage.create({
        data: {
          instituteId: institute.id,
          studentCount: 0,
          courseCount: 0,
          batchCount: 0,
          storageUsedMB: 0,
          testsCreatedThisMonth: 0
        }
      });

      // 5. Generate Initial Platform Invoice
      const invoice = await tx.platformInvoice.create({
        data: {
          invoiceNumber,
          instituteId: institute.id,
          subscriptionId: subscription.id,
          amount: price,
          taxAmount,
          totalAmount,
          status: price === 0 ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
          dueDate: new Date(Date.now() + 7 * 86400000),
          paidAt: price === 0 ? new Date() : null
        }
      });

      return {
        institute,
        adminUser: { id: adminUser.id, email: adminUser.email, role: adminUser.role },
        subscription: { ...subscription, planName: plan.name, tier: plan.tier },
        usage,
        invoice
      };
    });

    return result;
  }

  /**
   * Get all registered Institute Tenants (Super Admin)
   */
  static async getAllInstitutes(params: { search?: string; status?: InstituteStatus; planTier?: PlanTier; page?: number; limit?: number }) {
    const { search, status, planTier, page = 1, limit = 20 } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.InstituteWhereInput = {
      ...(status ? { status } : {}),
      ...(planTier ? { subscription: { plan: { tier: planTier } } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } },
              { email: { contains: search } },
              { customDomain: { contains: search } }
            ]
          }
        : {})
    };

    const [total, institutes] = await Promise.all([
      prisma.institute.count({ where }),
      prisma.institute.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          subscription: {
            include: { plan: true }
          },
          tenantUsage: true,
          _count: {
            select: {
              students: true,
              courses: true,
              batches: true,
              users: true
            }
          }
        }
      })
    ]);

    return {
      institutes,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get deep profile for single Institute Tenant
   */
  static async getInstituteById(id: string) {
    const institute = await prisma.institute.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: true } },
        tenantUsage: true,
        platformInvoices: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        users: {
          where: { role: UserRole.ADMIN },
          select: { id: true, email: true, status: true, lastLoginAt: true, createdAt: true }
        },
        _count: {
          select: {
            students: true,
            courses: true,
            subjects: true,
            batches: true,
            teachers: true,
            tests: true,
            fees: true
          }
        }
      }
    });

    if (!institute) {
      throw new AppError("Institute tenant not found", HTTP_STATUS.NOT_FOUND);
    }

    return institute;
  }

  /**
   * Update Institute Tenant Details (Super Admin)
   */
  static async updateInstituteTenant(id: string, input: UpdateInstituteTenantInput) {
    const existing = await prisma.institute.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Institute tenant not found", HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.institute.update({
      where: { id },
      data: input,
      include: {
        subscription: { include: { plan: true } }
      }
    });

    return updated;
  }

  /**
   * Toggle Institute Status (ACTIVE / SUSPENDED / ARCHIVED)
   */
  static async updateInstituteStatus(id: string, status: InstituteStatus) {
    const existing = await prisma.institute.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Institute tenant not found", HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.institute.update({
      where: { id },
      data: { status },
      include: { subscription: { include: { plan: true } } }
    });

    // If suspended, update subscription status as well
    if (status === InstituteStatus.SUSPENDED) {
      await prisma.subscription.updateMany({
        where: { instituteId: id },
        data: { status: SubscriptionStatus.PAST_DUE }
      });
    } else if (status === InstituteStatus.ACTIVE) {
      await prisma.subscription.updateMany({
        where: { instituteId: id },
        data: { status: SubscriptionStatus.ACTIVE }
      });
    }

    return updated;
  }

  /**
   * Get all SaaS Subscription Plans
   */
  static async getSubscriptionPlans() {
    return prisma.subscriptionPlan.findMany({
      orderBy: { monthlyPrice: "asc" },
      include: {
        _count: { select: { subscriptions: true } }
      }
    });
  }

  /**
   * Update Subscription Plan Configuration & Pricing
   */
  static async updateSubscriptionPlan(id: string, input: UpdatePlanPricingInput) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new AppError("Subscription plan not found", HTTP_STATUS.NOT_FOUND);
    }

    return prisma.subscriptionPlan.update({
      where: { id },
      data: input
    });
  }

  /**
   * Upgrade / Change an Institute's Subscription Plan
   */
  static async changeInstituteSubscription(instituteId: string, input: ChangeTenantSubscriptionInput) {
    const { planTier, billingCycle = BillingCycle.MONTHLY, autoRenew = true } = input;

    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      include: { subscription: true }
    });

    if (!institute) {
      throw new AppError("Institute tenant not found", HTTP_STATUS.NOT_FOUND);
    }

    const targetPlan = await prisma.subscriptionPlan.findUnique({
      where: { tier: planTier }
    });

    if (!targetPlan) {
      throw new AppError(`Plan tier '${planTier}' not found`, HTTP_STATUS.NOT_FOUND);
    }

    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === BillingCycle.ANNUAL) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const price = billingCycle === BillingCycle.ANNUAL ? Number(targetPlan.annualPrice) : Number(targetPlan.monthlyPrice);
    const taxAmount = Number((price * 0.18).toFixed(2));
    const totalAmount = price + taxAmount;

    const result = await prisma.$transaction(async (tx) => {
      // Generate invoice number inside transaction to prevent race conditions
      const invoiceCount = await tx.platformInvoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, "0")}`;

      const updatedSub = await tx.subscription.upsert({
        where: { instituteId },
        update: {
          planId: targetPlan.id,
          billingCycle,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          autoRenew
        },
        create: {
          instituteId,
          planId: targetPlan.id,
          billingCycle,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          autoRenew
        },
        include: { plan: true }
      });

      // Generate upgrade invoice if paying
      let invoice = null;
      if (price > 0) {
        invoice = await tx.platformInvoice.create({
          data: {
            invoiceNumber,
            instituteId,
            subscriptionId: updatedSub.id,
            amount: price,
            taxAmount,
            totalAmount,
            status: InvoiceStatus.PENDING,
            dueDate: new Date(Date.now() + 7 * 86400000)
          }
        });
      }

      return {
        subscription: updatedSub,
        invoice
      };
    });

    return result;
  }

  /**
   * Get all B2B Platform Invoices (Super Admin)
   */
  static async getPlatformInvoices(params: { status?: InvoiceStatus; page?: number; limit?: number }) {
    return this.getAllInvoices(params);
  }

  static async getAllInvoices(params: { status?: InvoiceStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 50 } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.PlatformInvoiceWhereInput = {
      ...(status ? { status } : {})
    };

    const [total, invoices] = await Promise.all([
      prisma.platformInvoice.count({ where }),
      prisma.platformInvoice.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          institute: { select: { id: true, name: true, code: true, email: true } },
          subscription: { include: { plan: true } }
        }
      })
    ]);

    return {
      invoices,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Record payment for B2B Platform Invoice (Super Admin)
   */
  static async recordInvoicePayment(invoiceId: string, paymentMethod = "BANK_TRANSFER", txnId?: string) {
    const invoice = await prisma.platformInvoice.findUnique({
      where: { id: invoiceId },
      include: { subscription: true }
    });

    if (!invoice) {
      throw new AppError("Platform invoice not found", HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.platformInvoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
          paymentMethod,
          paymentGatewayTxId: txnId || `MANUAL-${Date.now()}`
        }
      });

      if (invoice.subscriptionId) {
        await tx.subscription.update({
          where: { id: invoice.subscriptionId },
          data: { status: SubscriptionStatus.ACTIVE }
        });
      }

      return inv;
    });

    return updated;
  }
}
