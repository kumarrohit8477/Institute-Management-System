import { app } from "./src/app";
import { config } from "./src/config/env";
import { prisma } from "./src/config/prisma";
import http from "http";

const server = http.createServer(app);

const startServer = async () => {
  try {
    server.listen(config.port, "0.0.0.0", () => {
      console.log(
        `🚀 IMS Backend Server running on port ${config.port} [${config.nodeEnv}]`
      );
      console.log(`📡 Health check available at: /health`);
      console.log(`🔗 API Base route: /api/v1`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await prisma.$disconnect();
      console.log("Database connection closed.");
    } catch (err) {
      console.error("Error during database disconnect:", err);
    }
    process.exit(0);
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error("Forced shutdown due to timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason: any) => {
  console.error("Unhandled Rejection at:", reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

startServer();
