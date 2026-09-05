import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(
    new AppError(
      `Cannot find endpoint ${req.method} ${req.originalUrl} on this server`,
      HTTP_STATUS.NOT_FOUND
    )
  );
};
