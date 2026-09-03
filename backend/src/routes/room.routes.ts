import { Router } from "express";
import { RoomController } from "../controllers/room.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import {
  createRoomSchema,
  updateRoomSchema,
  roomQuerySchema
} from "../validations/room.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(resolveTenantContext);

router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createRoomSchema),
  RoomController.createRoom
);

router.get(
  "/",
  validateRequest(roomQuerySchema),
  RoomController.getRooms
);

router.get(
  "/:id",
  RoomController.getRoomById
);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateRoomSchema),
  RoomController.updateRoom
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  RoomController.deleteRoom
);

export const roomRoutes = router;
