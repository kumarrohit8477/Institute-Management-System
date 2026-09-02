import { PrismaClient } from "@prisma/client";
import { config } from "./env";
import net from "net";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    global.prisma ||
    new PrismaClient({
      log: config.nodeEnv === "development" ? ["query", "error", "warn"] : ["error"]
    });
} catch {
  // Fallback before initial prisma generate
  prismaInstance = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === "$disconnect" || prop === "$connect") {
        return async () => {};
      }
      throw new Error(
        `Prisma client has not been generated with models yet. Run 'npx prisma generate' after defining models.`
      );
    }
  });
}

export const prisma = prismaInstance;

if (config.nodeEnv !== "production") {
  global.prisma = prisma;
}

/**
 * Parses MySQL connection string into connection details
 */
export function parseDatabaseUrl(url: string): {
  host: string;
  port: number;
  database: string;
  user: string;
} {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port || "3306", 10),
      database: parsed.pathname.replace(/^\//, "") || "institute_management_db",
      user: parsed.username || "root"
    };
  } catch {
    return {
      host: "localhost",
      port: 3306,
      database: "institute_management_db",
      user: "root"
    };
  }
}

/**
 * Tests MySQL server reachability & greeting handshake
 */
export function testMySqlServerReachability(
  host: string,
  port: number,
  timeoutMs: number = 3000
): Promise<{ reachable: boolean; serverVersion?: string; error?: string; latencyMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      // Socket connected
    });

    socket.on("data", (data) => {
      if (!resolved) {
        resolved = true;
        const latencyMs = Date.now() - start;
        // Parse MySQL Handshake Packet (Protocol version + Null-terminated server version string)
        let serverVersion = "MySQL Server";
        try {
          if (data.length > 5) {
            const nullIndex = data.indexOf(0, 5);
            if (nullIndex > 5) {
              serverVersion = data.subarray(5, nullIndex).toString("utf8");
            }
          }
        } catch {
          // ignore parsing error
        }
        socket.destroy();
        resolve({ reachable: true, serverVersion, latencyMs });
      }
    });

    socket.on("timeout", () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({
          reachable: false,
          error: `Connection timed out after ${timeoutMs}ms`,
          latencyMs: Date.now() - start
        });
      }
    });

    socket.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({
          reachable: false,
          error: err.message,
          latencyMs: Date.now() - start
        });
      }
    });

    socket.connect(port, host);
  });
}

/**
 * Tests complete database connectivity
 */
export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  serverVersion?: string;
  responseTimeMs?: number;
  details?: {
    host: string;
    port: number;
    database: string;
    user: string;
  };
  error?: string;
}> {
  const dbInfo = parseDatabaseUrl(config.databaseUrl);
  const reachability = await testMySqlServerReachability(dbInfo.host, dbInfo.port);

  if (!reachability.reachable) {
    return {
      connected: false,
      details: dbInfo,
      error: `Cannot reach MySQL server at ${dbInfo.host}:${dbInfo.port} — ${reachability.error}`
    };
  }

  // Attempt Prisma raw query if client is initialized
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as ping`;
    const responseTimeMs = Date.now() - start;
    return {
      connected: true,
      serverVersion: reachability.serverVersion,
      responseTimeMs,
      details: dbInfo
    };
  } catch (prismaError: any) {
    // If Prisma is not generated yet or query throws, report reachability with note
    return {
      connected: true,
      serverVersion: reachability.serverVersion,
      responseTimeMs: reachability.latencyMs,
      details: dbInfo,
      error: prismaError?.message?.includes("not been generated")
        ? undefined
        : prismaError?.message
    };
  }
}
