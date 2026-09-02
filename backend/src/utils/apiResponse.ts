import { Response } from "express";
import { HTTP_STATUS } from "@ims/common";
import { ApiResponse } from "@ims/types";

export class ResponseHandler {
  static success<T>(
    res: Response,
    data?: T,
    message: string = "Success",
    statusCode: number = HTTP_STATUS.OK,
    meta?: ApiResponse["meta"]
  ): Response {
    const payload: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(
    res: Response,
    data?: T,
    message: string = "Resource created successfully"
  ): Response {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static error(
    res: Response,
    message: string = "Internal server error",
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = "INTERNAL_ERROR",
    details?: any
  ): Response {
    const payload: ApiResponse = {
      success: false,
      message,
      error: {
        code,
        message,
        details
      }
    };
    return res.status(statusCode).json(payload);
  }
}
