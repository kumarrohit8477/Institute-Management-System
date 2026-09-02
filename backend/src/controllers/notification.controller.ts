import { Response } from "express";
import { NotificationService } from "../services/notification.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class NotificationController {
  static broadcastNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await NotificationService.broadcastNotification(instituteId, req.body);
    return ResponseHandler.created(res, result, "Notification broadcast dispatched successfully");
  });

  static getMyNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const result = await NotificationService.getUserNotifications(userId, instituteId, req.query as any);
    return ResponseHandler.success(
      res,
      { notifications: result.notifications, unreadCount: result.unreadCount },
      "Notifications retrieved successfully",
      200,
      result.meta
    );
  });

  static markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const updated = await NotificationService.markAsRead(userId, instituteId, req.params.id);
    return ResponseHandler.success(res, updated, "Notification marked as read");
  });

  static markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const result = await NotificationService.markAllAsRead(userId, instituteId);
    return ResponseHandler.success(res, result, "All notifications marked as read");
  });
}
