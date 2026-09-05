import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { CourseStatus, Prisma } from "@prisma/client";
import { CreateCourseInput, UpdateCourseInput } from "../validations/course.validation";

export class CourseService {
  /**
   * Create a new course (e.g., JEE Preparation, NEET Preparation, Full Stack Development)
   */
  static async createCourse(instituteId: string, input: CreateCourseInput) {
    const { name, code, description, duration, durationUnit = "MONTHS", durationMonths, totalFees } = input;

    const existing = await prisma.course.findUnique({
      where: {
        instituteId_code: {
          instituteId,
          code: code.toUpperCase()
        }
      }
    });

    if (existing) {
      throw new AppError(`Course with code '${code}' already exists in this institute`, HTTP_STATUS.CONFLICT);
    }

    // Determine normalized durationMonths
    let calcMonths = durationMonths;
    if (duration) {
      if (durationUnit === "MONTHS") calcMonths = duration;
      else if (durationUnit === "YEARS") calcMonths = duration * 12;
      else if (durationUnit === "DAYS") calcMonths = Math.max(1, Math.round(duration / 30));
    }

    const course = await prisma.course.create({
      data: {
        instituteId,
        name,
        code: code.toUpperCase(),
        description,
        duration: duration || calcMonths || null,
        durationUnit: durationUnit || "MONTHS",
        durationMonths: calcMonths || null,
        totalFees: totalFees !== undefined && totalFees !== null ? new Prisma.Decimal(totalFees) : new Prisma.Decimal(0),
        status: CourseStatus.ACTIVE
      }
    });

    return course;
  }

  /**
   * List all courses with aggregate metrics
   */
  static async getCourses(instituteId: string, params: { search?: string; status?: CourseStatus; page?: number; limit?: number }) {
    const { search, status, page = 1, limit = 50 } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.CourseWhereInput = {
      instituteId,
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

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          courseSubjects: {
            orderBy: { displayOrder: "asc" },
            include: {
              subject: { select: { id: true, name: true, code: true, status: true } }
            }
          },
          _count: {
            select: {
              subjects: true,
              courseSubjects: true,
              batches: true,
              studyMaterials: true
            }
          }
        }
      })
    ]);

    return {
      courses,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get single course with its subjects, courseSubjects, and batches
   */
  static async getCourseById(instituteId: string, id: string) {
    const course = await prisma.course.findFirst({
      where: { id, instituteId },
      include: {
        courseSubjects: {
          orderBy: { displayOrder: "asc" },
          include: {
            subject: {
              include: {
                teachers: {
                  include: {
                    teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true, specialization: true } }
                  }
                }
              }
            }
          }
        },
        subjects: {
          orderBy: { createdAt: "asc" },
          include: {
            _count: { select: { teachers: true } }
          }
        },
        batches: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { students: true, batchSubjects: true } }
          }
        }
      }
    });

    if (!course) {
      throw new AppError("Course not found", HTTP_STATUS.NOT_FOUND);
    }

    return course;
  }

  /**
   * Update course details or status
   */
  static async updateCourse(instituteId: string, id: string, input: UpdateCourseInput) {
    const course = await prisma.course.findFirst({
      where: { id, instituteId }
    });

    if (!course) {
      throw new AppError("Course not found", HTTP_STATUS.NOT_FOUND);
    }

    const { name, code, description, duration, durationUnit, durationMonths, totalFees, status } = input;

    if (code && code.toUpperCase() !== course.code) {
      const existing = await prisma.course.findUnique({
        where: {
          instituteId_code: {
            instituteId,
            code: code.toUpperCase()
          }
        }
      });
      if (existing) {
        throw new AppError(`Course code '${code}' is already in use`, HTTP_STATUS.CONFLICT);
      }
    }

    let calcMonths = durationMonths;
    if (duration !== undefined) {
      const unit = durationUnit || course.durationUnit || "MONTHS";
      if (unit === "MONTHS") calcMonths = duration;
      else if (unit === "YEARS") calcMonths = (duration || 0) * 12;
      else if (unit === "DAYS") calcMonths = Math.max(1, Math.round((duration || 0) / 30));
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(code ? { code: code.toUpperCase() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(durationUnit !== undefined ? { durationUnit } : {}),
        ...(calcMonths !== undefined ? { durationMonths: calcMonths } : {}),
        ...(totalFees !== undefined && totalFees !== null ? { totalFees: new Prisma.Decimal(totalFees) } : {}),
        ...(status ? { status } : {})
      },
      include: {
        courseSubjects: {
          orderBy: { displayOrder: "asc" },
          include: { subject: true }
        },
        _count: { select: { subjects: true, courseSubjects: true, batches: true } }
      }
    });

    return updated;
  }

  /**
   * Delete a course
   */
  static async deleteCourse(instituteId: string, id: string) {
    const course = await prisma.course.findFirst({
      where: { id, instituteId },
      include: {
        _count: { select: { batches: true } }
      }
    });

    if (!course) {
      throw new AppError("Course not found", HTTP_STATUS.NOT_FOUND);
    }

    if (course._count.batches > 0) {
      throw new AppError(
        `Cannot delete course: It has ${course._count.batches} active batch(es) associated with it. Archive the course or remove batches first.`,
        HTTP_STATUS.CONFLICT
      );
    }

    await prisma.course.delete({
      where: { id }
    });

    return { success: true, message: "Course deleted successfully" };
  }
}

