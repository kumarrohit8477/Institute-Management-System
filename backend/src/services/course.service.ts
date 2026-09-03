import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { CourseStatus, Prisma } from "@prisma/client";
import { CreateCourseInput, UpdateCourseInput } from "../validations/course.validation";

export class CourseService {
  /**
   * Create a new course (e.g., JEE Preparation, NEET Preparation, Class 10)
   */
  static async createCourse(instituteId: string, input: CreateCourseInput) {
    const { name, code, description, durationMonths } = input;

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

    const course = await prisma.course.create({
      data: {
        instituteId,
        name,
        code: code.toUpperCase(),
        description,
        durationMonths,
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
    const skip = (page - 1) * limit;

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
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              subjects: true,
              batches: true
            }
          }
        }
      })
    ]);

    return {
      courses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single course with its subjects and batches
   */
  static async getCourseById(instituteId: string, id: string) {
    const course = await prisma.course.findFirst({
      where: { id, instituteId },
      include: {
        subjects: {
          orderBy: { createdAt: "asc" },
          include: {
            _count: { select: { teachers: true } }
          }
        },
        batches: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { students: true } }
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

    const { name, code, description, durationMonths, status } = input;

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

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(code ? { code: code.toUpperCase() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(durationMonths !== undefined ? { durationMonths } : {}),
        ...(status ? { status } : {})
      },
      include: {
        _count: { select: { subjects: true, batches: true } }
      }
    });

    return updated;
  }

  /**
   * Delete a course
   */
  static async deleteCourse(instituteId: string, id: string) {
    const course = await prisma.course.findFirst({
      where: { id, instituteId }
    });

    if (!course) {
      throw new AppError("Course not found", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.course.delete({
      where: { id }
    });

    return { success: true, message: "Course deleted successfully" };
  }
}

