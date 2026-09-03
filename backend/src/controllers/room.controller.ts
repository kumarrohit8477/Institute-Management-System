import { Response } from "express";
import { RoomService } from "../services/room.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class RoomController {
  static createRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await RoomService.createRoom(instituteId, req.body);
    return ResponseHandler.created(res, result, "Room created successfully");
  });

  static getRooms = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await RoomService.getRooms(instituteId, req.query as any);
    return ResponseHandler.success(res, result.rooms, "Rooms retrieved successfully", 200, result.meta);
  });

  static getRoomById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await RoomService.getRoomById(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Room details retrieved successfully");
  });

  static updateRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await RoomService.updateRoom(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, result, "Room updated successfully");
  });

  static deleteRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await RoomService.deleteRoom(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Room deleted successfully");
  });
}
