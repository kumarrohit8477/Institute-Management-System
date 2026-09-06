import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { config } from "../config/env";

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err instanceof AppError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal server error";
  let details = err instanceof AppError ? err.details : undefined;
  let errorCode = "INTERNAL_SERVER_ERROR";

  // Classify standard error categories
  switch (statusCode) {
    case HTTP_STATUS.BAD_REQUEST:
      errorCode = "VALIDATION_ERROR";
      break;
    case HTTP_STATUS.UNAUTHORIZED:
      errorCode = "UNAUTHORIZED";
      break;
    case HTTP_STATUS.FORBIDDEN:
      errorCode = "FORBIDDEN";
      break;
    case HTTP_STATUS.NOT_FOUND:
      errorCode = "NOT_FOUND";
      break;
    case HTTP_STATUS.CONFLICT:
      errorCode = "CONFLICT";
      break;
    case 429:
      errorCode = "RATE_LIMIT_EXCEEDED";
      break;
    default:
      if (statusCode >= 500) {
        errorCode = "INTERNAL_SERVER_ERROR";
      }
      break;
  }

  // Handle Prisma Known Request Errors (e.g. unique constraint, foreign key)
  if (err.name === "PrismaClientKnownRequestError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = "DATABASE_CONSTRAINT_ERROR";
    message = "Database operation constraint violated";
  }

  // Handle Prisma Validation Errors (e.g. invalid query arguments)
  if (err.name === "PrismaClientValidationError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = "DATABASE_VALIDATION_ERROR";
    message = "Invalid database query arguments";
  }

  // Handle Prisma Unknown Request Errors
  if (err.name === "PrismaClientUnknownRequestError") {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    errorCode = "DATABASE_ERROR";
    message = "An unexpected database error occurred";
  }

  // Log in console
  console.error(`[${errorCode}] [${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`);
  if (config.nodeEnv === "development" && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      ...(config.nodeEnv === "development" ? { stack: err.stack } : {})
    }
  });
};
