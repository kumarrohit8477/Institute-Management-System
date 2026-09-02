import express, { Application } from "express";
import cors from "cors";
import path from "path";
import { config } from "./config/env";
import { requestLogger } from "./middleware/logger";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { errorHandler } from "./middleware/errorHandler";
import { apiGeneralRateLimiter } from "./middleware/rateLimit.middleware";
import { apiRouter } from "./routes";
import { healthRoutes } from "./routes/health.routes";

export const createApp = (): Application => {
  const app: Application = express();

  // CORS Configuration - Permissive for multi-tenant and multi-app dev ports (5173, 5174, 3000, etc.)
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all local development origins and null origin (Postman / mobile)
        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Institute-Code",
        "x-institute-code",
        "Accept",
        "Origin",
        "X-Requested-With"
      ]
    })
  );

  // Body Parsing Middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Static File Serving for Uploaded Logos & Documents
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Request Logging
  app.use(requestLogger);

  // General API Rate Limiter
  app.use("/api", apiGeneralRateLimiter);

  // Health check routes
  app.use("/health", healthRoutes);

  // API Routes (support both /api and /api/v1 prefix)
  app.use("/api/v1", apiRouter);
  app.use("/api", apiRouter);

  // 404 Route Not Found Middleware
  app.use(notFoundHandler);

  // Global Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
