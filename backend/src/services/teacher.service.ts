import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { Prisma } from "@prisma/client";
import { CreateTeacherInput, UpdateTeacherInput, TeacherQueryParams } from "../validations/teacher.validation";

import { PasswordUtil } from "../utils/password";
import { UserRole, UserStatus } from "@prisma/client";

export class TeacherService {
  /**
   * Register a new teacher (with optional login credentials)
   */
  static async createTeacher(instituteId: string, input: any) {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      qualification,
      specialization,
      experienceYears = 0,
      skills,
      avatarUrl,
      bio,
      address,
      joiningDate,
      createUserAccount,
      password,
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

    // Optionally create User login account
    let userId: string | null = null;
    if (createUserAccount || password) {
      const existingUser = await prisma.user.findFirst({
        where: { email: email.toLowerCase(), instituteId }
      });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const defaultPassword = password || "Teacher@123";
        const passwordHash = await PasswordUtil.hash(defaultPassword);
        const newUser = await prisma.user.create({
          data: {
            instituteId,
            email: email.toLowerCase(),
            passwordHash,
            role: UserRole.TEACHER,
            status: UserStatus.ACTIVE
          }
        });
        userId = newUser.id;
      }
    }

    const teacher = await prisma.teacher.create({
      data: {
        instituteId,
        userId,
        employeeCode: employeeCode!,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        gender: gender || null,
        qualification,
        specialization,
        experienceYears,
        skills: skills || null,
        avatarUrl,
        bio,
        address,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        subjects: {
          create: subjectIds.map((subjectId: string) => ({
            subjectId
          }))
        }
      },
      include: {
        subjects: {
          include: {
            subject: true
          }
        },
        user: { select: { id: true, email: true, role: true, status: true } }
      }
    });

    return teacher;
  }

  /**
   * List teachers with search, filters & pagination
   */
  static async getTeachers(instituteId: string, params: TeacherQueryParams) {
    const { search, status, specialization, page = 1, limit = 20 } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

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
        take: limitNum,
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
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
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
        batchSubjects: {
          include: {
            batch: { select: { id: true, name: true, code: true, status: true, startDate: true, endDate: true } },
            subject: { select: { id: true, name: true, code: true } }
          }
        },
        assignments: {
          include: {
            course: { select: { id: true, name: true, code: true } },
            subject: { select: { id: true, name: true, code: true } },
            batch: { select: { id: true, name: true, code: true, status: true } }
          }
        },
        user: { select: { id: true, email: true, role: true, status: true, lastLoginAt: true } }
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
      skills,
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
        ...(skills !== undefined ? { skills } : {}),
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
   * Retrieve academic scope for logged in Teacher (Batches, Subjects, Timetable)
   */
  static async getTeacherAcademicScope(userId: string, instituteId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { userId, instituteId },
      include: {
        batchSubjects: {
          include: {
            batch: {
              include: {
                course: { select: { id: true, name: true, code: true } },
                _count: { select: { students: true } }
              }
            },
            subject: true
          }
        },
        assignments: {
          include: {
            batch: {
              include: {
                course: { select: { id: true, name: true, code: true } },
                _count: { select: { students: true } }
              }
            },
            subject: true
          }
        },
        timetables: {
          where: { status: "ACTIVE" },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          include: {
            batch: { select: { id: true, name: true, code: true } },
            subject: { select: { id: true, name: true, code: true } },
            room: { select: { id: true, name: true, code: true } }
          }
        }
      }
    });

    if (!teacher) {
      throw new AppError("Teacher profile not linked to this account", HTTP_STATUS.NOT_FOUND);
    }

    // Consolidate assigned batches
    const batchMap = new Map<string, any>();
    for (const bs of teacher.batchSubjects) {
      if (bs.batch) {
        batchMap.set(bs.batch.id, bs.batch);
      }
    }
    for (const a of teacher.assignments) {
      if (a.batch && !batchMap.has(a.batch.id)) {
        batchMap.set(a.batch.id, a.batch);
      }
    }

    return {
      teacher: {
        id: teacher.id,
        employeeCode: teacher.employeeCode,
        name: `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.email,
        phone: teacher.phone,
        specialization: teacher.specialization,
        skills: teacher.skills
      },
      assignedBatches: Array.from(batchMap.values()),
      batchSubjects: teacher.batchSubjects,
      timetables: teacher.timetables
    };
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

