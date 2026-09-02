import { testDatabaseConnection, prisma } from "../config/prisma";
import { config } from "../config/env";

async function main() {
  console.log("==================================================");
  console.log("  INSTITUTE MANAGEMENT SYSTEM — MYSQL & PRISMA TEST");
  console.log("==================================================");
  console.log(`Database URL:    ${config.databaseUrl.replace(/:([^:@]+)@/, ":****@")}`);
  console.log(`Environment:     ${config.nodeEnv}`);
  console.log("--------------------------------------------------");
  console.log("Testing connection to MySQL server...");

  const result = await testDatabaseConnection();

  if (result.connected) {
    console.log(`✅ MySQL Server Reachable: YES`);
    if (result.serverVersion) {
      console.log(`📦 Server Version:        ${result.serverVersion}`);
    }
    console.log(`⏱️ Connection Latency:    ${result.responseTimeMs}ms`);
    if (result.details) {
      console.log(`🌐 Host:                  ${result.details.host}:${result.details.port}`);
      console.log(`🗄️ Database Target:       ${result.details.database}`);
      console.log(`👤 User:                  ${result.details.user}`);
    }
    console.log("--------------------------------------------------");
    console.log("🎉 MySQL connection test PASSED!");
  } else {
    console.error(`❌ Connection FAILED:     ${result.error}`);
    console.log("--------------------------------------------------");
    console.log("Troubleshooting checklist:");
    console.log("1. Ensure MySQL service is running (`Get-Service *mysql*`)");
    console.log("2. Verify credentials and host in `.env` / `backend/.env`");
    console.log("3. Test port with: `Test-NetConnection -ComputerName localhost -Port 3306`");
  }
  console.log("==================================================");

  try {
    await prisma.$disconnect();
  } catch {
    // Ignore disconnect error if not connected
  }

  process.exit(result.connected ? 0 : 1);
}

main().catch((err) => {
  console.error("❌ Fatal error during DB test execution:", err);
  process.exit(1);
});
