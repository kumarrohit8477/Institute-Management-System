import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { RoomType, RoomStatus, Prisma } from "@prisma/client";
import { CreateRoomInput, UpdateRoomInput } from "../validations/room.validation";

export class RoomService {
  /**
   * Create a new classroom / lab facility
   */
  static async createRoom(instituteId: string, input: CreateRoomInput) {
    const { name, code, capacity = 30, type = RoomType.CLASSROOM, status = RoomStatus.ACTIVE } = input;

    const existing = await prisma.room.findUnique({
      where: {
        instituteId_code: {
          instituteId,
          code: code.toUpperCase()
        }
      }
    });

    if (existing) {
      throw new AppError(`Room with code '${code}' already exists in this institute`, HTTP_STATUS.CONFLICT);
    }

    const room = await prisma.room.create({
      data: {
        instituteId,
        name,
        code: code.toUpperCase(),
        capacity,
        type,
        status
      }
    });

    return room;
  }

  /**
   * List all rooms with search, type, and status filtering
   */
  static async getRooms(
    instituteId: string,
    params: { search?: string; type?: RoomType; status?: RoomStatus; page?: number; limit?: number }
  ) {
    const { search, type, status, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.RoomWhereInput = {
      instituteId,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } }
            ]
          }
        : {})
    };

    const [total, rooms] = await Promise.all([
      prisma.room.count({ where }),
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: "asc" },
        include: {
          _count: { select: { timetables: true } }
        }
      })
    ]);

    return {
      rooms,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single room details with active schedules
   */
  static async getRoomById(instituteId: string, id: string) {
    const room = await prisma.room.findFirst({
      where: { id, instituteId },
      include: {
        timetables: {
          include: {
            batch: { select: { id: true, name: true, code: true } },
            subject: { select: { id: true, name: true, code: true } },
            teacher: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!room) {
      throw new AppError("Room not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    return room;
  }

  /**
   * Update room details
   */
  static async updateRoom(instituteId: string, id: string, input: UpdateRoomInput) {
    const room = await prisma.room.findFirst({
      where: { id, instituteId }
    });

    if (!room) {
      throw new AppError("Room not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const { name, code, capacity, type, status } = input;

    if (code && code.toUpperCase() !== room.code) {
      const existing = await prisma.room.findUnique({
        where: {
          instituteId_code: {
            instituteId,
            code: code.toUpperCase()
          }
        }
      });
      if (existing) {
        throw new AppError(`Room code '${code}' already exists`, HTTP_STATUS.CONFLICT);
      }
    }

    const updated = await prisma.room.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(code ? { code: code.toUpperCase() } : {}),
        ...(capacity !== undefined ? { capacity } : {}),
        ...(type ? { type } : {}),
        ...(status ? { status } : {})
      }
    });

    return updated;
  }

  /**
   * Delete room
   */
  static async deleteRoom(instituteId: string, id: string) {
    const room = await prisma.room.findFirst({
      where: { id, instituteId }
    });

    if (!room) {
      throw new AppError("Room not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const activeTimetableCount = await prisma.timetable.count({
      where: { roomId: id, status: "ACTIVE" }
    });

    if (activeTimetableCount > 0) {
      throw new AppError(
        `Cannot delete room: It is assigned to ${activeTimetableCount} active class schedule(s).`,
        HTTP_STATUS.CONFLICT
      );
    }

    await prisma.room.delete({ where: { id } });

    return { success: true, message: "Room deleted successfully" };
  }
}
