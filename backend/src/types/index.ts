import { Request } from "express";
import { IUser } from "./entities";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  instituteId?: string;
}

export * from "./enums";
export * from "./entities";
export * from "./api";
