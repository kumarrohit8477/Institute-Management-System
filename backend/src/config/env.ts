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
  databaseUrl: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
}
export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  corsOrigin: process.env.CLIENT_URL || "*",
  databaseUrl:
    process.env.DATABASE_URL ||
    "mysql://root:root@localhost:3306/ims_db",

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
};