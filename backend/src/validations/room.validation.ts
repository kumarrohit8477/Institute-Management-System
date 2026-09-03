import { z } from "zod";
import { RoomType, RoomStatus } from "@prisma/client";

export const createRoomSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Room name is required" }).min(2),
    code: z.string({ required_error: "Room code is required" }).min(2).toUpperCase(),
    capacity: z.coerce.number().min(1).default(30),
    type: z.nativeEnum(RoomType).optional().default(RoomType.CLASSROOM),
    status: z.nativeEnum(RoomStatus).optional().default(RoomStatus.ACTIVE)
  })
});

export const updateRoomSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Room ID is required" })
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).toUpperCase().optional(),
    capacity: z.coerce.number().min(1).optional(),
    type: z.nativeEnum(RoomType).optional(),
    status: z.nativeEnum(RoomStatus).optional()
  })
});

export const roomQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    type: z.nativeEnum(RoomType).optional(),
    status: z.nativeEnum(RoomStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>["body"];
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>["body"];
