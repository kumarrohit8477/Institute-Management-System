import { Request } from "express";
import { IUser } from "@ims/types";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  instituteId?: string;
}

export * from "@ims/types";
