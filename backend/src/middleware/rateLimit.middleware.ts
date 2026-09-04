import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const ipStore: Map<string, RateLimitStore> = new Map();

/**
 * Reset all rate limit counters (useful for development/testing)
 */
export const clearRateLimitStore = () => {
  ipStore.clear();
};

/**
 * Creates an in-memory rate limiting middleware
 * @param windowMs Time window in milliseconds (default: 15 minutes)
 * @param max Max allowed requests within windowMs (default: 100)
 * @param message Custom message on rate limit exceed
 */
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
} = {}) => {
  const isDev = process.env.NODE_ENV !== "production";
  const {
    windowMs = 15 * 60 * 1000, // 15 mins
    max = isDev ? 10000 : 100, // Generous limit in development to prevent lockouts
    message = "Too many requests from this IP, please try again later."
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development mode
    if (isDev) {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const now = Date.now();

    const record = ipStore.get(ip);

    if (!record || now > record.resetTime) {
      ipStore.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      res.setHeader("X-RateLimit-Reset", new Date(now + windowMs).toISOString());
      return next();
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", new Date(record.resetTime).toISOString());

      return next(
        new AppError(
          `${message} Retry after ${retryAfterSeconds} seconds.`,
          429
        )
      );
    }

    record.count += 1;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader("X-RateLimit-Reset", new Date(record.resetTime).toISOString());

    return next();
  };
};

// Preset limiters for sensitive endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === "production" ? 30 : 10000, // 30 in prod, 10,000 in dev
  message: "Too many login attempts. For security reasons, please wait before trying again."
});

export const apiGeneralRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10000
});
