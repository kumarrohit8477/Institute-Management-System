import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { Prisma } from "@prisma/client";
import { CreateMaterialInput, UpdateMaterialInput, MaterialQueryParams } from "../validations/material.validation";

export class MaterialService {
  /**
   * Upload / Add a new study material (Admin)
   */
  static async createMaterial(instituteId: string, uploadedById: string, input: CreateMaterialInput) {
    const { courseId, subjectId, batchId, title, description, fileUrl, fileType, fileSizeBytes } = input;

    // Verify course & subject
    const course = await prisma.course.findFirst({ where: { id: courseId, instituteId } });
    if (!course) throw new AppError("Course not found in this institute", HTTP_STATUS.NOT_FOUND);

    const subject = await prisma.subject.findFirst({ where: { id: subjectId, courseId, instituteId } });
    if (!subject) throw new AppError("Subject not found or does not belong to this course", HTTP_STATUS.NOT_FOUND);

    if (batchId) {
      const batch = await prisma.batch.findFirst({ where: { id: batchId, courseId, instituteId } });
      if (!batch) throw new AppError("Batch not found or does not belong to this course", HTTP_STATUS.NOT_FOUND);
    }

    const material = await prisma.studyMaterial.create({
      data: {
        instituteId,
        courseId,
        subjectId,
        batchId: batchId || null,
        title,
        description,
        fileUrl,
        fileType,
        fileSizeBytes: fileSizeBytes ? BigInt(fileSizeBytes) : null,
        uploadedById
      },
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        batch: { select: { id: true, name: true, code: true } },
        uploadedBy: { select: { id: true, email: true } }
      }
    });

    return {
      ...material,
      fileSizeBytes: material.fileSizeBytes ? material.fileSizeBytes.toString() : null
    };
  }

  /**
   * List all study materials (Admin)
   */
  static async getMaterials(instituteId: string, params: MaterialQueryParams) {
    const { courseId, subjectId, batchId, fileType, search, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StudyMaterialWhereInput = {
      instituteId,
      ...(courseId ? { courseId } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(batchId ? { batchId } : {}),
      ...(fileType ? { fileType } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    };

    const [total, materials] = await Promise.all([
      prisma.studyMaterial.count({ where }),
      prisma.studyMaterial.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
          batch: { select: { id: true, name: true, code: true } },
          uploadedBy: { select: { id: true, email: true } }
        }
      })
    ]);

    const formatted = materials.map((m) => ({
      ...m,
      fileSizeBytes: m.fileSizeBytes ? m.fileSizeBytes.toString() : null
    }));

    return {
      materials: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single material details
   */
  static async getMaterialById(instituteId: string, id: string) {
    const material = await prisma.studyMaterial.findFirst({
      where: { id, instituteId },
      include: {
        course: true,
        subject: true,
        batch: true,
        uploadedBy: { select: { id: true, email: true } }
      }
    });

    if (!material) throw new AppError("Study material not found", HTTP_STATUS.NOT_FOUND);

    return {
      ...material,
      fileSizeBytes: material.fileSizeBytes ? material.fileSizeBytes.toString() : null
    };
  }

  /**
   * Update study material
   */
  static async updateMaterial(instituteId: string, id: string, input: UpdateMaterialInput) {
    const material = await prisma.studyMaterial.findFirst({
      where: { id, instituteId }
    });

    if (!material) throw new AppError("Study material not found", HTTP_STATUS.NOT_FOUND);

    const updated = await prisma.studyMaterial.update({
      where: { id },
      data: {
        ...(input.courseId ? { courseId: input.courseId } : {}),
        ...(input.subjectId ? { subjectId: input.subjectId } : {}),
        ...(input.batchId !== undefined ? { batchId: input.batchId } : {}),
        ...(input.title ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.fileUrl ? { fileUrl: input.fileUrl } : {}),
        ...(input.fileType ? { fileType: input.fileType } : {})
      },
      include: {
        course: true,
        subject: true,
        batch: true
      }
    });

    return {
      ...updated,
      fileSizeBytes: updated.fileSizeBytes ? updated.fileSizeBytes.toString() : null
    };
  }

  /**
   * Delete study material
   */
  static async deleteMaterial(instituteId: string, id: string) {
    const material = await prisma.studyMaterial.findFirst({
      where: { id, instituteId }
    });

    if (!material) throw new AppError("Study material not found", HTTP_STATUS.NOT_FOUND);

    await prisma.studyMaterial.delete({ where: { id } });
    return { deleted: true, id };
  }

  /**
   * Student Scoping: Returns only materials for student's enrolled courses and batches
   */
  static async getStudentMaterials(userId: string, instituteId: string, params: { subjectId?: string; fileType?: any; search?: string }) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        batches: {
          where: { status: "ACTIVE" },
          include: {
            batch: { select: { id: true, courseId: true, name: true, code: true } }
          }
        }
      }
    });

    if (!student) {
      throw new AppError("Student profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const batchIds = student.batches.map((b) => b.batchId);
    const courseIds = [...new Set(student.batches.map((b) => b.batch.courseId))];

    if (courseIds.length === 0) {
      return {
        student: { id: student.id, name: `${student.firstName} ${student.lastName}` },
        materials: []
      };
    }

    // Material is accessible if:
    // 1. Course matches student's enrolled courses
    // 2. AND (batchId is NULL [all batches] OR batchId is in student's enrolled batches)
    const where: Prisma.StudyMaterialWhereInput = {
      instituteId,
      courseId: { in: courseIds },
      AND: [
        {
          OR: [
            { batchId: null },
            { batchId: { in: batchIds } }
          ]
        }
      ],
      ...(params.subjectId ? { subjectId: params.subjectId } : {}),
      ...(params.fileType ? { fileType: params.fileType } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search } },
              { description: { contains: params.search } }
            ]
          }
        : {})
    };

    const materials = await prisma.studyMaterial.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        batch: { select: { id: true, name: true, code: true } }
      }
    });

    const formatted = materials.map((m) => ({
      ...m,
      fileSizeBytes: m.fileSizeBytes ? m.fileSizeBytes.toString() : null
    }));

    return {
      student: { id: student.id, name: `${student.firstName} ${student.lastName}` },
      enrolledBatches: student.batches.map((b) => b.batch),
      materials: formatted
    };
  }
}
