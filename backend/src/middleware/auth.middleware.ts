import { Response, NextFunction } from "express";
import { TokenUtil } from "../utils/token";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { AuthenticatedRequest } from "../types";
import { prisma } from "../config/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import { AnyZodObject, ZodError } from "zod";

/**
 * Validates request payload against Zod schema
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }));
        next(
          new AppError(
            `Validation error: ${issues.map((i) => i.message).join(", ")}`,
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            issues
          )
        );
      } else {
        next(error);
      }
    }
  };
};

/**
 * Verifies JWT token and attaches user entity to request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Authentication token is missing", HTTP_STATUS.UNAUTHORIZED);
    }

    let payload;
    try {
      payload = TokenUtil.verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new AppError("Authentication token has expired", HTTP_STATUS.UNAUTHORIZED);
      }
      throw new AppError("Invalid authentication token", HTTP_STATUS.UNAUTHORIZED);
    }

    // Load active user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      throw new AppError("User belonging to this token no longer exists", HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError("User account is inactive or blocked", HTTP_STATUS.FORBIDDEN);
    }

    req.user = {
      id: user.id,
      instituteId: user.instituteId || undefined,
      email: user.email,
      role: user.role as any,
      status: user.status as any,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    req.instituteId = user.instituteId || undefined;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restricts endpoint to authorized roles (RBAC)
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new AppError(
          `Forbidden: You do not have permission to perform this action (${req.user.role} role is unauthorized)`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};
