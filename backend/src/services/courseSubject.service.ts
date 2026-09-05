import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { AddCourseSubjectInput, UpdateCourseSubjectInput } from "../validations/courseSubject.validation";

export class CourseSubjectService {
  /**
   * Add a subject to a course curriculum
   */
  static async addSubjectToCourse(instituteId: string, courseId: string, input: AddCourseSubjectInput) {
    const { subjectId, displayOrder = 0, estimatedDuration } = input;

    // 1. Verify course belongs to institute
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId }
    });
    if (!course) {
      throw new AppError("Course not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // 2. Verify subject belongs to institute
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, instituteId }
    });
    if (!subject) {
      throw new AppError("Subject not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // 3. Check for existing relationship
    const existing = await prisma.courseSubject.findUnique({
      where: {
        courseId_subjectId: {
          courseId,
          subjectId
        }
      }
    });

    if (existing) {
      throw new AppError("Subject is already included in this course", HTTP_STATUS.CONFLICT);
    }

    // If subject currently has no courseId, backfill it
    if (!subject.courseId) {
      await prisma.subject.update({
        where: { id: subjectId },
        data: { courseId }
      });
    }

    const courseSubject = await prisma.courseSubject.create({
      data: {
        courseId,
        subjectId,
        displayOrder,
        estimatedDuration
      },
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true, description: true, status: true } }
      }
    });

    return courseSubject;
  }

  /**
   * List all subjects included in a course (ordered by displayOrder)
   */
  static async getCourseSubjects(instituteId: string, courseId: string) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId }
    });
    if (!course) {
      throw new AppError("Course not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const courseSubjects = await prisma.courseSubject.findMany({
      where: { courseId },
      orderBy: { displayOrder: "asc" },
      include: {
        subject: {
          include: {
            teachers: {
              include: {
                teacher: {
                  select: { id: true, firstName: true, lastName: true, employeeCode: true, specialization: true }
                }
              }
            }
          }
        }
      }
    });

    return courseSubjects;
  }

  /**
   * Update course subject display order or estimated duration
   */
  static async updateCourseSubject(
    instituteId: string,
    courseId: string,
    subjectId: string,
    input: UpdateCourseSubjectInput
  ) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId }
    });
    if (!course) {
      throw new AppError("Course not found", HTTP_STATUS.NOT_FOUND);
    }

    const existing = await prisma.courseSubject.findUnique({
      where: {
        courseId_subjectId: {
          courseId,
          subjectId
        }
      }
    });

    if (!existing) {
      throw new AppError("Subject is not mapped to this course", HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.courseSubject.update({
      where: { id: existing.id },
      data: {
        ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
        ...(input.estimatedDuration !== undefined ? { estimatedDuration: input.estimatedDuration } : {})
      },
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } }
      }
    });

    return updated;
  }

  /**
   * Remove subject from a course curriculum
   */
  static async removeSubjectFromCourse(instituteId: string, courseId: string, subjectId: string) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId }
    });
    if (!course) {
      throw new AppError("Course not found", HTTP_STATUS.NOT_FOUND);
    }

    const existing = await prisma.courseSubject.findUnique({
      where: {
        courseId_subjectId: {
          courseId,
          subjectId
        }
      }
    });

    if (!existing) {
      throw new AppError("Subject is not mapped to this course", HTTP_STATUS.NOT_FOUND);
    }

    // Check if active batch subjects exist in batches of this course
    const activeBatchUsage = await prisma.batchSubject.findFirst({
      where: {
        subjectId,
        batch: { courseId, instituteId }
      },
      include: { batch: { select: { name: true, code: true } } }
    });

    if (activeBatchUsage) {
      throw new AppError(
        `Cannot remove subject from course: It is actively taught in batch '${activeBatchUsage.batch.name}' (${activeBatchUsage.batch.code})`,
        HTTP_STATUS.CONFLICT
      );
    }

    await prisma.courseSubject.delete({
      where: { id: existing.id }
    });

    return { success: true, message: "Subject removed from course curriculum" };
  }
}
