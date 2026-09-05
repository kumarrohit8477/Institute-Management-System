import { Request, Response } from "express";
import { ResponseHandler } from "../utils/apiResponse";
import { APP_NAME, API_VERSION } from "../common";
import { testDatabaseConnection } from "../config/prisma";

export class HealthController {
  static async getHealth(_req: Request, res: Response): Promise<Response> {
    const dbStatus = await testDatabaseConnection();

    return ResponseHandler.success(
      res,
      {
        application: APP_NAME,
        version: API_VERSION,
        status: dbStatus.connected ? "UP" : "DEGRADED",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          provider: "mysql",
          status: dbStatus.connected ? "CONNECTED" : "DISCONNECTED",
          latencyMs: dbStatus.responseTimeMs,
          error: dbStatus.error
        }
      },
      dbStatus.connected
        ? "Application and database are healthy"
        : "Application is up but database is not connected"
    );
  }
}
