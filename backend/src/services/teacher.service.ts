import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { Prisma } from "@prisma/client";
import { CreateTeacherInput, UpdateTeacherInput, TeacherQueryParams } from "../validations/teacher.validation";

export class TeacherService {
  /**
   * Register a new teacher (No login credentials created)
   */
  static async createTeacher(instituteId: string, input: CreateTeacherInput) {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      qualification,
      specialization,
      experienceYears = 0,
      avatarUrl,
      bio,
      address,
      joiningDate,
      subjectIds = []
    } = input;

    // Auto-generate employee code if not provided
    let employeeCode = input.employeeCode;
    if (!employeeCode) {
      const year = new Date().getFullYear();
      const count = await prisma.teacher.count({ where: { instituteId } });
      employeeCode = `FAC-${year}-${String(count + 1).padStart(4, "0")}`;
    } else {
      const existing = await prisma.teacher.findUnique({
        where: {
          instituteId_employeeCode: {
            instituteId,
            employeeCode
          }
        }
      });
      if (existing) {
        throw new AppError(`Employee code '${employeeCode}' is already in use`, HTTP_STATUS.CONFLICT);
      }
    }

    // Verify subject IDs belong to this institute
    if (subjectIds.length > 0) {
      const validSubjectsCount = await prisma.subject.count({
        where: {
          id: { in: subjectIds },
          instituteId
        }
      });
      if (validSubjectsCount !== subjectIds.length) {
        throw new AppError("One or more assigned subjects do not exist in this institute", HTTP_STATUS.BAD_REQUEST);
      }
    }

    const teacher = await prisma.teacher.create({
      data: {
        instituteId,
        employeeCode: employeeCode!,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        gender: gender || null,
        qualification,
        specialization,
        experienceYears,
        avatarUrl,
        bio,
        address,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        subjects: {
          create: subjectIds.map((subjectId) => ({
            subjectId
          }))
        }
      },
      include: {
        subjects: {
          include: {
            subject: true
          }
        }
      }
    });

    return teacher;
  }

  /**
   * List teachers with search, filters & pagination
   */
  static async getTeachers(instituteId: string, params: TeacherQueryParams) {
    const { search, status, specialization, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TeacherWhereInput = {
      instituteId,
      ...(status ? { status } : {}),
      ...(specialization ? { specialization: { contains: specialization } } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { employeeCode: { contains: search } },
              { phone: { contains: search } }
            ]
          }
        : {})
    };

    const [total, teachers] = await Promise.all([
      prisma.teacher.count({ where }),
      prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          subjects: {
            include: {
              subject: { select: { id: true, name: true, code: true } }
            }
          },
          assignments: {
            include: {
              batch: { select: { id: true, name: true, code: true } },
              subject: { select: { id: true, name: true, code: true } }
            }
          }
        }
      })
    ]);

    return {
      teachers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get teacher profile by ID
   */
  static async getTeacherById(instituteId: string, id: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, instituteId },
      include: {
        subjects: {
          include: {
            subject: {
              include: {
                course: { select: { id: true, name: true, code: true } }
              }
            }
          }
        },
        assignments: {
          include: {
            course: { select: { id: true, name: true, code: true } },
            subject: { select: { id: true, name: true, code: true } },
            batch: { select: { id: true, name: true, code: true, status: true } }
          }
        }
      }
    });

    if (!teacher) {
      throw new AppError("Teacher not found", HTTP_STATUS.NOT_FOUND);
    }

    return teacher;
  }

  /**
   * Update teacher details or status
   */
  static async updateTeacher(instituteId: string, id: string, input: UpdateTeacherInput) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, instituteId }
    });

    if (!teacher) {
      throw new AppError("Teacher not found", HTTP_STATUS.NOT_FOUND);
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      qualification,
      specialization,
      experienceYears,
      avatarUrl,
      bio,
      address,
      status
    } = input;

    const updated = await prisma.teacher.update({
      where: { id },
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email: email.toLowerCase() } : {}),
        ...(phone ? { phone } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(qualification !== undefined ? { qualification } : {}),
        ...(specialization !== undefined ? { specialization } : {}),
        ...(experienceYears !== undefined ? { experienceYears } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(status ? { status } : {})
      },
      include: {
        subjects: {
          include: { subject: true }
        }
      }
    });

    return updated;
  }

  /**
   * Delete a teacher record
   */
  static async deleteTeacher(instituteId: string, id: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, instituteId }
    });

    if (!teacher) {
      throw new AppError("Teacher not found", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.teacher.delete({
      where: { id }
    });

    return { success: true, message: "Teacher deleted successfully" };
  }
}

