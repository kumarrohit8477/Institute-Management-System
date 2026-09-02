import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { Prisma } from "@prisma/client";
import {
  BroadcastNotificationInput,
  NotificationTargetType,
  NotificationQueryParams
} from "../validations/notification.validation";

export class NotificationService {
  /**
   * Broadcast notification to All Students, Course, Batch, or Individual Student (Admin)
   */
  static async broadcastNotification(instituteId: string, input: BroadcastNotificationInput) {
    const { targetType, targetId, title, message, type, actionUrl } = input;

    let recipientUserIds: string[] = [];

    switch (targetType) {
      case NotificationTargetType.ALL: {
        const students = await prisma.student.findMany({
          where: { instituteId, status: "ACTIVE" },
          select: { userId: true }
        });
        recipientUserIds = students.map((s) => s.userId);
        break;
      }

      case NotificationTargetType.COURSE: {
        if (!targetId) {
          throw new AppError("Target Course ID is required when targeting by course", HTTP_STATUS.BAD_REQUEST);
        }
        const batches = await prisma.batch.findMany({
          where: { courseId: targetId, instituteId, status: "ACTIVE" },
          include: {
            students: {
              where: { status: "ACTIVE" },
              include: { student: { select: { userId: true } } }
            }
          }
        });

        const userIds = new Set<string>();
        for (const b of batches) {
          for (const sb of b.students) {
            userIds.add(sb.student.userId);
          }
        }
        recipientUserIds = Array.from(userIds);
        break;
      }

      case NotificationTargetType.BATCH: {
        if (!targetId) {
          throw new AppError("Target Batch ID is required when targeting by batch", HTTP_STATUS.BAD_REQUEST);
        }
        const studentBatches = await prisma.studentBatch.findMany({
          where: {
            batchId: targetId,
            status: "ACTIVE",
            batch: { instituteId }
          },
          include: { student: { select: { userId: true } } }
        });

        recipientUserIds = studentBatches.map((sb) => sb.student.userId);
        break;
      }

      case NotificationTargetType.STUDENT: {
        if (!targetId) {
          throw new AppError("Target Student ID is required when targeting by student", HTTP_STATUS.BAD_REQUEST);
        }
        const student = await prisma.student.findFirst({
          where: {
            instituteId,
            OR: [{ id: targetId }, { userId: targetId }]
          },
          select: { userId: true }
        });

        if (!student) {
          throw new AppError("Target student not found in this institute", HTTP_STATUS.NOT_FOUND);
        }
        recipientUserIds = [student.userId];
        break;
      }

      default:
        throw new AppError("Invalid notification target type", HTTP_STATUS.BAD_REQUEST);
    }

    if (recipientUserIds.length === 0) {
      return {
        dispatchedCount: 0,
        message: "No active recipient students found matching target criteria"
      };
    }

    const created = await prisma.notification.createMany({
      data: recipientUserIds.map((userId) => ({
        instituteId,
        recipientId: userId,
        title,
        message,
        type,
        actionUrl: actionUrl || null,
        isRead: false
      }))
    });

    return {
      dispatchedCount: created.count,
      targetType,
      targetId: targetId || null,
      title,
      type
    };
  }

  /**
   * Get user's notifications and unread count (Student & Admin)
   */
  static async getUserNotifications(userId: string, instituteId: string, params: NotificationQueryParams) {
    const { isRead, type, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      instituteId,
      recipientId: userId,
      ...(isRead ? { isRead: isRead === "true" } : {}),
      ...(type ? { type } : {})
    };

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { instituteId, recipientId: userId, isRead: false }
      }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      })
    ]);

    return {
      unreadCount,
      notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(userId: string, instituteId: string, notificationId: string) {
    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: userId,
        instituteId
      }
    });

    if (!existing) {
      throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return updated;
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string, instituteId: string) {
    const updated = await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        instituteId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return { updatedCount: updated.count };
  }
}
