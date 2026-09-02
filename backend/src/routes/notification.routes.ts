import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import {
  broadcastNotificationSchema,
  notificationQuerySchema
} from "../validations/notification.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Student & User endpoints
router.get("/my", validateRequest(notificationQuerySchema), NotificationController.getMyNotifications);
router.patch("/:id/read", NotificationController.markAsRead);
router.post("/mark-all-read", NotificationController.markAllAsRead);

// Admin-only broadcast
router.post(
  "/broadcast",
  authorize(UserRole.ADMIN),
  validateRequest(broadcastNotificationSchema),
  NotificationController.broadcastNotification
);

export const notificationRoutes = router;
