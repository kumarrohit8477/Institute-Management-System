import dotenv from "dotenv";
import path from "path";
dotenv.config();
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});
export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigin: string | string[];
  clientUrl: string;
  databaseUrl: string;
  superAdminEmail: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  smtp: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    from?: string;
  };
}
export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  corsOrigin: process.env.CLIENT_URL || "*",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  databaseUrl:
    process.env.DATABASE_URL ||
    "mysql://root:root@localhost:3306/ims_db",
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || "superadmin@ims.local",

  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ||
      "default_access_secret_for_development",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      "default_refresh_secret_for_development",
    accessExpiresIn:
      process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn:
      process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM
  }
};