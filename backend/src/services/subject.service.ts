import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { SubjectStatus, Prisma } from "@prisma/client";
import { CreateSubjectInput, UpdateSubjectInput } from "../validations/subject.validation";

export class SubjectService {
  /**
   * Create a new subject (optionally assigned to a course or created centrally)
   */
  static async createSubject(instituteId: string, input: CreateSubjectInput) {
    const { courseId, name, code, description } = input;

    let targetCourse = null;
    if (courseId) {
      targetCourse = await prisma.course.findFirst({
        where: { id: courseId, instituteId }
      });

      if (!targetCourse) {
        throw new AppError("Course not found in this institute", HTTP_STATUS.NOT_FOUND);
      }
    }

    // Verify code uniqueness within institute
    const existing = await prisma.subject.findFirst({
      where: {
        instituteId,
        code: code.toUpperCase()
      }
    });

    if (existing) {
      throw new AppError(`Subject code '${code}' already exists in this institute`, HTTP_STATUS.CONFLICT);
    }

    const subject = await prisma.subject.create({
      data: {
        instituteId,
        courseId: courseId || null,
        name,
        code: code.toUpperCase(),
        description,
        status: SubjectStatus.ACTIVE
      },
      include: {
        course: { select: { id: true, name: true, code: true } }
      }
    });

    // If courseId provided, also link via CourseSubject
    if (courseId) {
      const maxOrder = await prisma.courseSubject.aggregate({
        where: { courseId },
        _max: { displayOrder: true }
      });
      const nextOrder = (maxOrder._max.displayOrder || 0) + 1;

      await prisma.courseSubject.upsert({
        where: { courseId_subjectId: { courseId, subjectId: subject.id } },
        update: {},
        create: {
          courseId,
          subjectId: subject.id,
          displayOrder: nextOrder
        }
      });
    }

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
      ...(courseId
        ? {
            OR: [
              { courseId },
              { courseSubjects: { some: { courseId } } }
            ]
          }
        : {}),
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
          courseSubjects: {
            include: { course: { select: { id: true, name: true, code: true } } }
          },
          teachers: {
            include: {
              teacher: {
                select: { id: true, employeeCode: true, firstName: true, lastName: true, specialization: true }
              }
            }
          },
          _count: {
            select: {
              teachers: true,
              teacherAssignments: true,
              batchSubjects: true,
              courseSubjects: true
            }
          }
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
        courseSubjects: {
          include: { course: { select: { id: true, name: true, code: true } } }
        },
        teachers: {
          include: {
            teacher: {
              select: { id: true, employeeCode: true, firstName: true, lastName: true, specialization: true, phone: true }
            }
          }
        },
        batchSubjects: {
          include: {
            batch: { select: { id: true, name: true, code: true } },
            assignedTeacher: { select: { id: true, firstName: true, lastName: true } }
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
      const existing = await prisma.subject.findFirst({
        where: {
          instituteId,
          code: code.toUpperCase(),
          id: { not: id }
        }
      });
      if (existing) {
        throw new AppError(`Subject code '${code}' is already in use in this institute`, HTTP_STATUS.CONFLICT);
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
        course: { select: { id: true, name: true, code: true } },
        courseSubjects: { include: { course: true } }
      }
    });

    return updated;
  }

  /**
   * Delete a subject safely (prevent deletion if used in batch subjects or timetable)
   */
  static async deleteSubject(instituteId: string, id: string) {
    const subject = await prisma.subject.findFirst({
      where: { id, instituteId },
      include: {
        _count: {
          select: {
            batchSubjects: true,
            timetables: true,
            questions: true,
            tests: true
          }
        }
      }
    });

    if (!subject) {
      throw new AppError("Subject not found", HTTP_STATUS.NOT_FOUND);
    }

    if (subject._count.batchSubjects > 0) {
      throw new AppError(
        `Cannot delete subject: It is currently assigned to ${subject._count.batchSubjects} active batch(es). Remove it from batches first.`,
        HTTP_STATUS.CONFLICT
      );
    }

    if (subject._count.timetables > 0) {
      throw new AppError(
        `Cannot delete subject: It has ${subject._count.timetables} class timetable slot(s) scheduled.`,
        HTTP_STATUS.CONFLICT
      );
    }

    await prisma.subject.delete({
      where: { id }
    });

    return { success: true, message: "Subject deleted successfully" };
  }
}

