import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/env";
import { UserRole } from "@prisma/client";

export interface TokenPayload {
  userId: string;
  instituteId?: string | null;
  email: string;
  role: UserRole;
}

export class TokenUtil {
  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"]
    };
    return jwt.sign(payload, config.jwt.accessSecret, options);
  }

  static generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"]
    };
    return jwt.sign(payload, config.jwt.refreshSecret, options);
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  }
}
