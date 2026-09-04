import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { PasswordUtil } from "../utils/password";
import { HTTP_STATUS } from "@ims/common";
import { UserRole, UserStatus, StudentStatus, Prisma } from "@prisma/client";
import { CreateStudentInput, UpdateStudentInput, StudentQueryParams } from "../validations/student.validation";

export class StudentService {
  /**
   * Register a new student and generate user credentials
   */
  static async createStudent(instituteId: string, input: CreateStudentInput) {
    const {
      firstName,
      lastName,
      email,
      password = "StudentPassword123!",
      phone,
      dateOfBirth,
      gender,
      address,
      avatarUrl,
      guardianName,
      guardianPhone,
      guardianEmail,
      batchId,
      rollNumber
    } = input;

    // Check if email already exists in institute
    const existingUser = await prisma.user.findUnique({
      where: {
        instituteId_email: {
          instituteId,
          email: email.toLowerCase()
        }
      }
    });

    if (existingUser) {
      throw new AppError("A user or student with this email already exists in the institute", HTTP_STATUS.CONFLICT);
    }

    // Auto-generate admission number if not provided
    let admissionNumber = input.admissionNumber;
    if (!admissionNumber) {
      const year = new Date().getFullYear();
      const count = await prisma.student.count({ where: { instituteId } });
      admissionNumber = `ADM-${year}-${String(count + 1).padStart(4, "0")}`;
    } else {
      const existingAdmission = await prisma.student.findUnique({
        where: {
          instituteId_admissionNumber: {
            instituteId,
            admissionNumber
          }
        }
      });
      if (existingAdmission) {
        throw new AppError(`Admission number '${admissionNumber}' already exists`, HTTP_STATUS.CONFLICT);
      }
    }

    // Check batch if provided
    if (batchId) {
      const batch = await prisma.batch.findFirst({
        where: { id: batchId, instituteId }
      });
      if (!batch) {
        throw new AppError("Specified batch not found in this institute", HTTP_STATUS.NOT_FOUND);
      }
    }

    // Hash password for User account
    const passwordHash = await PasswordUtil.hash(password);

    // Create User, Student, and optional StudentBatch in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          instituteId,
          email: email.toLowerCase(),
          passwordHash,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE
        }
      });

      const student = await tx.student.create({
        data: {
          instituteId,
          userId: user.id,
          admissionNumber: admissionNumber!,
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          address,
          avatarUrl,
          guardianName,
          guardianPhone,
          guardianEmail,
          status: StudentStatus.ACTIVE,
          admissionDate: new Date()
        }
      });

      if (batchId) {
        await tx.studentBatch.create({
          data: {
            studentId: student.id,
            batchId,
            rollNumber: rollNumber || student.admissionNumber
          }
        });
      }

      return {
        ...student,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status
        },
        initialPassword: password
      };
    });

    return result;
  }

  /**
   * Paginated student query with search and filters
   */
  static async getStudents(instituteId: string, params: StudentQueryParams) {
    const { search, status, gender, batchId, courseId, page = 1, limit = 20 } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.StudentWhereInput = {
      instituteId,
      ...(status ? { status } : {}),
      ...(gender ? { gender } : {}),
      ...(batchId
        ? {
            batches: {
              some: { batchId, status: "ACTIVE" }
            }
          }
        : {}),
      ...(courseId
        ? {
            batches: {
              some: {
                batch: { courseId },
                status: "ACTIVE"
              }
            }
          }
        : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { admissionNumber: { contains: search } },
              { phone: { contains: search } }
            ]
          }
        : {})
    };

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, email: true, status: true, lastLoginAt: true }
          },
          batches: {
            include: {
              batch: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  courseId: true,
                  maxStrength: true,
                  course: {
                    select: { id: true, name: true, code: true }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    return {
      students,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get student details by ID
   */
  static async getStudentById(instituteId: string, id: string) {
    const student = await prisma.student.findFirst({
      where: { id, instituteId },
      include: {
        user: {
          select: { id: true, email: true, status: true, lastLoginAt: true, role: true }
        },
        batches: {
          include: {
            batch: {
              include: {
                course: { select: { id: true, name: true, code: true } }
              }
            }
          }
        }
      }
    });

    if (!student) {
      throw new AppError("Student not found", HTTP_STATUS.NOT_FOUND);
    }

    return student;
  }

  /**
   * Update student profile and status
   */
  static async updateStudent(instituteId: string, id: string, input: UpdateStudentInput) {
    const student = await prisma.student.findFirst({
      where: { id, instituteId },
      include: { user: true }
    });

    if (!student) {
      throw new AppError("Student not found", HTTP_STATUS.NOT_FOUND);
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      avatarUrl,
      guardianName,
      guardianPhone,
      guardianEmail,
      status
    } = input;

    // Check email clash if email is changed
    if (email && email.toLowerCase() !== student.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: {
          instituteId_email: {
            instituteId,
            email: email.toLowerCase()
          }
        }
      });
      if (existing) {
        throw new AppError("Email is already taken by another user", HTTP_STATUS.CONFLICT);
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (email && email.toLowerCase() !== student.email.toLowerCase()) {
        await tx.user.update({
          where: { id: student.userId },
          data: { email: email.toLowerCase() }
        });
      }

      if (status) {
        const userStatus = status === StudentStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.BLOCKED;
        await tx.user.update({
          where: { id: student.userId },
          data: { status: userStatus }
        });
      }

      return tx.student.update({
        where: { id },
        data: {
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(email ? { email: email.toLowerCase() } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null } : {}),
          ...(gender !== undefined ? { gender } : {}),
          ...(address !== undefined ? { address } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
          ...(guardianName !== undefined ? { guardianName } : {}),
          ...(guardianPhone !== undefined ? { guardianPhone } : {}),
          ...(guardianEmail !== undefined ? { guardianEmail } : {}),
          ...(status ? { status } : {})
        },
        include: {
          user: { select: { id: true, email: true, status: true } },
          batches: { include: { batch: true } }
        }
      });
    });

    return updated;
  }

  /**
   * Retrieve complete academic summary for the authenticated student
   * (Enrolled Courses, Active Batches, Subjects, and Assigned Faculty)
   */
  static async getStudentAcademics(userId: string, instituteId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        institute: { select: { id: true, name: true, code: true, logoUrl: true } },
        batches: {
          where: { status: "ACTIVE" },
          include: {
            batch: {
              include: {
                course: {
                  include: {
                    subjects: {
                      include: {
                        teachers: {
                          include: {
                            teacher: {
                              select: {
                                id: true,
                                employeeCode: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                qualification: true,
                                specialization: true,
                                experienceYears: true,
                                avatarUrl: true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                teacherAssignments: {
                  include: {
                    teacher: {
                      select: {
                        id: true,
                        employeeCode: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        qualification: true,
                        specialization: true,
                        avatarUrl: true
                      }
                    },
                    subject: { select: { id: true, name: true, code: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!student) {
      throw new AppError("Student profile not found", HTTP_STATUS.NOT_FOUND);
    }

    // Extract unique courses, subjects, and teachers
    const coursesMap = new Map<string, any>();
    const subjectsMap = new Map<string, any>();
    const teachersMap = new Map<string, any>();
    const batchesList: any[] = [];

    for (const sb of student.batches) {
      const batch = sb.batch;
      batchesList.push({
        id: batch.id,
        name: batch.name,
        code: batch.code,
        rollNumber: sb.rollNumber,
        enrolledAt: sb.enrolledAt,
        startDate: batch.startDate,
        endDate: batch.endDate,
        status: batch.status,
        courseName: batch.course.name,
        courseCode: batch.course.code
      });

      if (!coursesMap.has(batch.course.id)) {
        coursesMap.set(batch.course.id, {
          id: batch.course.id,
          name: batch.course.name,
          code: batch.course.code,
          description: batch.course.description,
          durationMonths: batch.course.durationMonths,
          status: batch.course.status
        });
      }

      for (const subj of batch.course.subjects) {
        if (!subjectsMap.has(subj.id)) {
          subjectsMap.set(subj.id, {
            id: subj.id,
            courseId: subj.courseId,
            courseName: batch.course.name,
            name: subj.name,
            code: subj.code,
            description: subj.description,
            teachers: subj.teachers.map((t) => t.teacher)
          });
        }

        for (const t of subj.teachers) {
          if (!teachersMap.has(t.teacher.id)) {
            teachersMap.set(t.teacher.id, {
              ...t.teacher,
              subjectName: subj.name
            });
          }
        }
      }

      for (const assignment of batch.teacherAssignments) {
        if (!teachersMap.has(assignment.teacher.id)) {
          teachersMap.set(assignment.teacher.id, {
            ...assignment.teacher,
            subjectName: assignment.subject.name,
            batchName: batch.name
          });
        }
      }
    }

    return {
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        status: student.status,
        admissionDate: student.admissionDate
      },
      institute: student.institute,
      batches: batchesList,
      courses: Array.from(coursesMap.values()),
      subjects: Array.from(subjectsMap.values()),
      teachers: Array.from(teachersMap.values())
    };
  }
}
