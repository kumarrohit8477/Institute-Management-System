import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { SubjectStatus, Prisma } from "@prisma/client";
import { CreateSubjectInput, UpdateSubjectInput } from "../validations/subject.validation";

export class SubjectService {
  /**
   * Create a new subject assigned to a course
   */
  static async createSubject(instituteId: string, input: CreateSubjectInput) {
    const { courseId, name, code, description } = input;

    // Verify course belongs to this institute
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId }
    });

    if (!course) {
      throw new AppError("Course not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const existing = await prisma.subject.findUnique({
      where: {
        courseId_code: {
          courseId,
          code: code.toUpperCase()
        }
      }
    });

    if (existing) {
      throw new AppError(`Subject code '${code}' already exists in this course`, HTTP_STATUS.CONFLICT);
    }

    const subject = await prisma.subject.create({
      data: {
        instituteId,
        courseId,
        name,
        code: code.toUpperCase(),
        description,
        status: SubjectStatus.ACTIVE
      },
      include: {
        course: { select: { id: true, name: true, code: true } }
      }
    });

    return subject;
  }

  /**
   * List subjects (optionally filtered by course)
   */
  static async getSubjects(instituteId: string, params: { courseId?: string; search?: string; status?: SubjectStatus; page?: number; limit?: number }) {
    const { courseId, search, status, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.SubjectWhereInput = {
      instituteId,
      ...(courseId ? { courseId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    };

    const [total, subjects] = await Promise.all([
      prisma.subject.count({ where }),
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          course: { select: { id: true, name: true, code: true } },
          _count: { select: { teachers: true, teacherAssignments: true } }
        }
      })
    ]);

    return {
      subjects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single subject by ID
   */
  static async getSubjectById(instituteId: string, id: string) {
    const subject = await prisma.subject.findFirst({
      where: { id, instituteId },
      include: {
        course: true,
        teachers: {
          include: {
            teacher: {
              select: { id: true, employeeCode: true, firstName: true, lastName: true, specialization: true }
            }
          }
        },
        teacherAssignments: {
          include: {
            teacher: { select: { id: true, firstName: true, lastName: true } },
            batch: { select: { id: true, name: true, code: true } }
          }
        }
      }
    });

    if (!subject) {
      throw new AppError("Subject not found", HTTP_STATUS.NOT_FOUND);
    }

    return subject;
  }

  /**
   * Update subject details or status
   */
  static async updateSubject(instituteId: string, id: string, input: UpdateSubjectInput) {
    const subject = await prisma.subject.findFirst({
      where: { id, instituteId }
    });

    if (!subject) {
      throw new AppError("Subject not found", HTTP_STATUS.NOT_FOUND);
    }

    const { name, code, description, status } = input;

    if (code && code.toUpperCase() !== subject.code) {
      const existing = await prisma.subject.findUnique({
        where: {
          courseId_code: {
            courseId: subject.courseId,
            code: code.toUpperCase()
          }
        }
      });
      if (existing) {
        throw new AppError(`Subject code '${code}' already exists in this course`, HTTP_STATUS.CONFLICT);
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(code ? { code: code.toUpperCase() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {})
      },
      include: {
        course: { select: { id: true, name: true, code: true } }
      }
    });

    return updated;
  }
}
