import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { SubscriptionPlan, UserRole } from "@prisma/client";

/**
 * Helper to fetch active plan for the current tenant
 */
async function getTenantPlan(instituteId: string): Promise<SubscriptionPlan | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { instituteId },
    include: { plan: true }
  });

  return subscription?.plan || null;
}

/**
 * Enforce maximum student limit quota for the tenant's plan tier
 */
export const enforceStudentQuota = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role === UserRole.SUPER_ADMIN) return next();

    const instituteId = req.instituteId;
    if (!instituteId) return next();

    const plan = await getTenantPlan(instituteId);
    if (!plan) return next();

    const currentCount = await prisma.student.count({ where: { instituteId } });

    if (currentCount >= plan.maxStudents) {
      throw new AppError(
        `PLAN_LIMIT_EXCEEDED: You have reached the maximum student limit (${plan.maxStudents}) allowed on the ${plan.name} tier. Please upgrade your subscription plan to enroll more students.`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Enforce maximum courses quota
 */
export const enforceCourseQuota = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role === UserRole.SUPER_ADMIN) return next();

    const instituteId = req.instituteId;
    if (!instituteId) return next();

    const plan = await getTenantPlan(instituteId);
    if (!plan) return next();

    const currentCount = await prisma.course.count({ where: { instituteId } });

    if (currentCount >= plan.maxCourses) {
      throw new AppError(
        `PLAN_LIMIT_EXCEEDED: You have reached the maximum course limit (${plan.maxCourses}) allowed on the ${plan.name} tier. Please upgrade your plan.`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Enforce maximum batches quota
 */
export const enforceBatchQuota = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role === UserRole.SUPER_ADMIN) return next();

    const instituteId = req.instituteId;
    if (!instituteId) return next();

    const plan = await getTenantPlan(instituteId);
    if (!plan) return next();

    const currentCount = await prisma.batch.count({ where: { instituteId } });

    if (currentCount >= plan.maxBatches) {
      throw new AppError(
        `PLAN_LIMIT_EXCEEDED: You have reached the maximum batch limit (${plan.maxBatches}) allowed on the ${plan.name} tier. Please upgrade your plan.`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Enforce feature gate (e.g. hasOnlineCBT, hasCustomDomain, hasPushNotifications)
 */
export const enforceFeatureFlag = (feature: keyof SubscriptionPlan) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role === UserRole.SUPER_ADMIN) return next();

      const instituteId = req.instituteId;
      if (!instituteId) return next();

      const plan = await getTenantPlan(instituteId);
      if (!plan) return next();

      if (!plan[feature]) {
        throw new AppError(
          `FEATURE_NOT_INCLUDED: The feature '${String(feature)}' is not available on your current ${plan.name} tier. Please upgrade to unlock this feature.`,
          HTTP_STATUS.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
