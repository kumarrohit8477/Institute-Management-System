import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { InstituteStatus, SubscriptionStatus, UserRole } from "@prisma/client";

/**
 * Tenant Isolation & Resolution Middleware
 * Resolves tenant from request headers, subdomain, or authenticated session token
 */
export const resolveTenantContext = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Super Admin bypasses single-tenant restrictions
    if (req.user?.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // 2. Extract tenant identifier
    let instituteId = req.instituteId || req.user?.instituteId;
    const headerCode = req.headers["x-institute-code"] as string;

    if (!instituteId && headerCode) {
      const institute = await prisma.institute.findUnique({
        where: { code: headerCode.toUpperCase() },
        select: { id: true }
      });
      if (institute) {
        instituteId = institute.id;
      }
    }

    if (!instituteId) {
      // If endpoint requires tenant but none found
      if (req.user) {
        throw new AppError("No tenant context found for authenticated user", HTTP_STATUS.FORBIDDEN);
      }
      return next();
    }

    // 3. Verify Tenant Health & Subscription Status
    const tenant = await prisma.institute.findUnique({
      where: { id: instituteId },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    });

    if (!tenant) {
      throw new AppError("Target institute tenant not found", HTTP_STATUS.NOT_FOUND);
    }

    if (tenant.status === InstituteStatus.SUSPENDED) {
      throw new AppError(
        "Institute subscription is suspended. Please contact platform support or renew subscription.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    if (tenant.status === InstituteStatus.INACTIVE || tenant.status === InstituteStatus.ARCHIVED) {
      throw new AppError("Institute account is inactive or archived", HTTP_STATUS.FORBIDDEN);
    }

    // 4. Check trial expiration if on trial
    if (tenant.subscription?.status === SubscriptionStatus.TRIAL && tenant.subscription.trialEndsAt) {
      if (new Date() > new Date(tenant.subscription.trialEndsAt)) {
        throw new AppError(
          "Your 14-day free trial has expired. Please upgrade to a paid plan to continue access.",
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    req.instituteId = tenant.id;
    next();
  } catch (error) {
    next(error);
  }
};
