import { z } from "zod";
import { NotificationType } from "@prisma/client";

export enum NotificationTargetType {
  ALL = "ALL",
  COURSE = "COURSE",
  BATCH = "BATCH",
  STUDENT = "STUDENT"
}

export const broadcastNotificationSchema = z.object({
  body: z.object({
    targetType: z.nativeEnum(NotificationTargetType, { required_error: "Target type is required" }),
    targetId: z.string().optional().nullable(),
    title: z.string({ required_error: "Notification title is required" }).min(2),
    message: z.string({ required_error: "Notification message is required" }).min(2),
    type: z.nativeEnum(NotificationType).default(NotificationType.ANNOUNCEMENT),
    actionUrl: z.string().optional().nullable()
  })
});

export const notificationQuerySchema = z.object({
  query: z.object({
    isRead: z.enum(["true", "false"]).optional(),
    type: z.nativeEnum(NotificationType).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>["body"];
export type NotificationQueryParams = z.infer<typeof notificationQuerySchema>["query"];
