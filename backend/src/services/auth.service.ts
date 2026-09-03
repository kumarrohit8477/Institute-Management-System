import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { PasswordUtil } from "../utils/password";
import { TokenUtil, TokenPayload } from "../utils/token";
import { HTTP_STATUS } from "@ims/common";
import { UserStatus, InstituteStatus, UserRole } from "@prisma/client";
import { LoginInput } from "../validations/auth.validation";

export class AuthService {
  /**
   * Authenticate user (Super Admin, Admin or Student)
   * Supports authentication via Email or Student Admission Number
   */
  static async login(input: LoginInput) {
    const { email: rawIdentifier, password, instituteCode } = input;
    const identifier = rawIdentifier.trim();

    let user: any = null;

    // 1. Locate Institute if instituteCode provided
    let targetInstituteId: string | undefined;
    if (instituteCode) {
      const institute = await prisma.institute.findUnique({
        where: { code: instituteCode.trim().toUpperCase() }
      });

      if (!institute) {
        throw new AppError("Invalid institute code or institute not found", HTTP_STATUS.NOT_FOUND);
      }

      if (institute.status !== InstituteStatus.ACTIVE && institute.status !== InstituteStatus.TRIAL) {
        throw new AppError("Institute account is currently inactive or suspended", HTTP_STATUS.FORBIDDEN);
      }

      targetInstituteId = institute.id;
    }

    // 2. Check if identifier is an email (contains '@')
    if (identifier.includes("@")) {
      if (targetInstituteId) {
        user = await prisma.user.findUnique({
          where: {
            instituteId_email: {
              instituteId: targetInstituteId,
              email: identifier.toLowerCase()
            }
          },
          include: {
            institute: true,
            student: true
          }
        });
      } else {
        // Find across institutes by email (also finds Super Admin without instituteId)
        const users = await prisma.user.findMany({
          where: { email: identifier.toLowerCase() },
          include: {
            institute: true,
            student: true
          }
        });

        if (users.length > 0) {
          user =
            users.find((u) => u.role === UserRole.SUPER_ADMIN) ||
            users.find(
              (u) =>
                u.institute?.status === InstituteStatus.ACTIVE ||
                u.institute?.status === InstituteStatus.TRIAL
            ) ||
            users[0];
        }
      }
    } else {
      // 3. Identifier is not an email — Check Student Admission Number or Teacher Employee Code
      const studentWhere: any = { admissionNumber: identifier };
      if (targetInstituteId) {
        studentWhere.instituteId = targetInstituteId;
      }

      const studentProfile = await prisma.student.findFirst({
        where: studentWhere,
        include: {
          user: {
            include: {
              institute: true,
              student: true,
              teacher: true
            }
          },
          institute: true
        }
      });

      if (studentProfile?.user) {
        user = studentProfile.user;
      } else {
        // Check Teacher Employee Code
        const teacherWhere: any = { employeeCode: identifier.toUpperCase() };
        if (targetInstituteId) {
          teacherWhere.instituteId = targetInstituteId;
        }

        const teacherProfile = await prisma.teacher.findFirst({
          where: teacherWhere,
          include: {
            user: {
              include: {
                institute: true,
                student: true,
                teacher: true
              }
            },
            institute: true
          }
        });

        if (teacherProfile?.user) {
          user = teacherProfile.user;
        }
      }
    }

    // If still not found, try fallback lookup across User email directly
    if (!user) {
      const fallbackUser = await prisma.user.findFirst({
        where: {
          email: identifier.toLowerCase(),
          ...(targetInstituteId ? { instituteId: targetInstituteId } : {})
        },
        include: {
          institute: true,
          student: true,
          teacher: true
        }
      });
      if (fallbackUser) user = fallbackUser;
    }

    if (!user) {
      throw new AppError("Invalid credentials. Please check your email/ID and password.", HTTP_STATUS.UNAUTHORIZED);
    }

    // 4. Validate password
    const isPasswordValid = await PasswordUtil.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials. Please check your email/ID and password.", HTTP_STATUS.UNAUTHORIZED);
    }

    // 5. Check account status
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(
        `User account is ${user.status.toLowerCase()}. Please contact your institute administrator.`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    if (
      user.role !== UserRole.SUPER_ADMIN &&
      user.institute &&
      user.institute.status !== InstituteStatus.ACTIVE &&
      user.institute.status !== InstituteStatus.TRIAL
    ) {
      throw new AppError(
        "Institute is currently inactive or suspended. Access denied.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    // 6. Generate Tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      email: user.email,
      role: user.role
    };

    const accessToken = TokenUtil.generateAccessToken(tokenPayload);
    const refreshToken = TokenUtil.generateRefreshToken(tokenPayload);

    // 7. Update user session
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLoginAt: new Date()
      }
    });

    // Determine readable display name
    const userName = user.student
      ? `${user.student.firstName} ${user.student.lastName}`
      : (user as any).teacher
      ? `${(user as any).teacher.firstName} ${(user as any).teacher.lastName}`
      : user.role === UserRole.SUPER_ADMIN
      ? "Platform Super Admin"
      : user.role === UserRole.ADMIN
      ? "Institute Administrator"
      : user.email.split("@")[0];

    return {
      user: {
        id: user.id,
        name: userName,
        email: user.email,
        role: user.role,
        organizationId: user.instituteId || null,
        instituteId: user.instituteId || null,
        status: user.status,
        lastLoginAt: user.lastLoginAt
      },
      token: accessToken,
      accessToken,
      refreshToken,
      institute: user.institute
        ? {
            id: user.institute.id,
            name: user.institute.name,
            code: user.institute.code,
            logoUrl: user.institute.logoUrl
          }
        : null,
      student: user.student
        ? {
            id: user.student.id,
            admissionNumber: user.student.admissionNumber,
            firstName: user.student.firstName,
            lastName: user.student.lastName,
            email: user.student.email,
            phone: user.student.phone,
            avatarUrl: user.student.avatarUrl,
            status: user.student.status
          }
        : null,
      teacher: (user as any).teacher
        ? {
            id: (user as any).teacher.id,
            employeeCode: (user as any).teacher.employeeCode,
            firstName: (user as any).teacher.firstName,
            lastName: (user as any).teacher.lastName,
            email: (user as any).teacher.email,
            phone: (user as any).teacher.phone,
            specialization: (user as any).teacher.specialization,
            avatarUrl: (user as any).teacher.avatarUrl
          }
        : null,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  /**
   * Refresh JWT access token using a valid refresh token
   */
  static async refreshAccessToken(refreshTokenString: string) {
    let payload: TokenPayload;
    try {
      payload = TokenUtil.verifyRefreshToken(refreshTokenString);
    } catch {
      throw new AppError("Invalid or expired refresh token", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        institute: true,
        student: true
      }
    });

    if (!user || user.refreshToken !== refreshTokenString) {
      throw new AppError("Invalid refresh token session", HTTP_STATUS.UNAUTHORIZED);
    }

    if (
      user.status !== UserStatus.ACTIVE ||
      (user.role !== UserRole.SUPER_ADMIN &&
        user.institute &&
        user.institute.status !== InstituteStatus.ACTIVE &&
        user.institute.status !== InstituteStatus.TRIAL)
    ) {
      throw new AppError("User or institute is no longer active", HTTP_STATUS.FORBIDDEN);
    }

    // Rotate tokens
    const newPayload: TokenPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      email: user.email,
      role: user.role
    };

    const newAccessToken = TokenUtil.generateAccessToken(newPayload);
    const newRefreshToken = TokenUtil.generateRefreshToken(newPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    };
  }

  /**
   * Invalidate user refresh token session
   */
  static async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
    return { loggedOut: true };
  }

  /**
   * Retrieve current authenticated user profile
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        institute: true,
        student: true,
        teacher: true
      }
    });

    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    const userName = user.student
      ? `${user.student.firstName} ${user.student.lastName}`
      : (user as any).teacher
      ? `${(user as any).teacher.firstName} ${(user as any).teacher.lastName}`
      : user.role === UserRole.SUPER_ADMIN
      ? "Platform Super Admin"
      : user.role === UserRole.ADMIN
      ? "Institute Administrator"
      : user.email.split("@")[0];

    return {
      id: user.id,
      name: userName,
      email: user.email,
      role: user.role,
      organizationId: user.instituteId || null,
      instituteId: user.instituteId || null,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      institute: user.institute
        ? {
            id: user.institute.id,
            name: user.institute.name,
            code: user.institute.code,
            logoUrl: user.institute.logoUrl,
            email: user.institute.email,
            phone: user.institute.phone
          }
        : null,
      student: user.student
        ? {
            id: user.student.id,
            admissionNumber: user.student.admissionNumber,
            firstName: user.student.firstName,
            lastName: user.student.lastName,
            email: user.student.email,
            phone: user.student.phone,
            avatarUrl: user.student.avatarUrl,
            status: user.student.status,
            admissionDate: user.student.admissionDate
          }
        : null,
      teacher: (user as any).teacher
        ? {
            id: (user as any).teacher.id,
            employeeCode: (user as any).teacher.employeeCode,
            firstName: (user as any).teacher.firstName,
            lastName: (user as any).teacher.lastName,
            email: (user as any).teacher.email,
            phone: (user as any).teacher.phone,
            specialization: (user as any).teacher.specialization,
            avatarUrl: (user as any).teacher.avatarUrl
          }
        : null
    };
  }
}
