import crypto from "crypto";
import { prisma } from "../config/prisma";
import { config } from "../config/env";
import { AppError } from "../utils/appError";
import { PasswordUtil } from "../utils/password";
import { TokenUtil, TokenPayload } from "../utils/token";
import { EmailService } from "./email.service";
import { HTTP_STATUS } from "../common";
import { UserStatus, InstituteStatus, UserRole } from "@prisma/client";
import {
  LoginInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput
} from "../validations/auth.validation";

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

    // 2. Collect candidate user accounts
    let candidates: any[] = [];

    if (identifier.includes("@")) {
      const emailLower = identifier.toLowerCase();
      if (targetInstituteId) {
        const found = await prisma.user.findUnique({
          where: {
            instituteId_email: {
              instituteId: targetInstituteId,
              email: emailLower
            }
          },
          include: {
            institute: true,
            student: true,
            teacher: true
          }
        });
        if (found) candidates.push(found);
      } else {
        candidates = await prisma.user.findMany({
          where: { email: emailLower },
          include: {
            institute: true,
            student: true,
            teacher: true
          }
        });
      }
    } else {
      // 3. Identifier is not an email — Check Student Admission Number or Teacher Employee Code
      const studentWhere: any = {
        OR: [
          { admissionNumber: identifier },
          { admissionNumber: identifier.toUpperCase() }
        ]
      };
      if (targetInstituteId) {
        studentWhere.instituteId = targetInstituteId;
      }

      const studentProfiles = await prisma.student.findMany({
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

      for (const sp of studentProfiles) {
        if (sp.user) candidates.push(sp.user);
      }

      if (candidates.length === 0) {
        const teacherWhere: any = {
          OR: [
            { employeeCode: identifier },
            { employeeCode: identifier.toUpperCase() }
          ]
        };
        if (targetInstituteId) {
          teacherWhere.instituteId = targetInstituteId;
        }

        const teacherProfiles = await prisma.teacher.findMany({
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

        for (const tp of teacherProfiles) {
          if (tp.user) candidates.push(tp.user);
        }
      }
    }

    if (candidates.length === 0) {
      throw new AppError("Invalid credentials. Please check your email/ID and password.", HTTP_STATUS.UNAUTHORIZED);
    }

    // 4. Test candidate accounts against provided password
    for (const candidate of candidates) {
      const isMatch = await PasswordUtil.compare(password, candidate.passwordHash);
      if (isMatch) {
        user = candidate;
        break;
      }
    }

    if (!user) {
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
        mustChangePassword: user.mustChangePassword ?? false,
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
            logoUrl: user.institute.logoUrl,
            tagline: user.institute.tagline
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
      mustChangePassword: user.mustChangePassword ?? false,
      lastLoginAt: user.lastLoginAt,
      institute: user.institute
        ? {
            id: user.institute.id,
            name: user.institute.name,
            code: user.institute.code,
            logoUrl: user.institute.logoUrl,
            tagline: user.institute.tagline,
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

  /**
   * Change user password (authenticated user)
   */
  static async changePassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    const isCurrentPasswordValid = await PasswordUtil.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect. Please try again.", HTTP_STATUS.BAD_REQUEST);
    }

    const isSameAsCurrent = await PasswordUtil.compare(newPassword, user.passwordHash);
    if (isSameAsCurrent) {
      throw new AppError("New password must be different from current password.", HTTP_STATUS.BAD_REQUEST);
    }

    const newHashedPassword = await PasswordUtil.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHashedPassword,
        mustChangePassword: false,
        refreshToken: null // Revoke existing refresh token session to require re-authentication if needed
      }
    });

    return {
      success: true,
      message: "Password updated successfully."
    };
  }

  /**
   * Request password reset token email
   */
  static async forgotPassword(input: ForgotPasswordInput) {
    const email = input.email.trim().toLowerCase();

    // Look up user by email (supports Super Admin and Institute users)
    const user = await prisma.user.findFirst({
      where: { email },
      orderBy: { createdAt: "asc" }
    });

    if (user) {
      // Generate 32-byte secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

      // Invalidate any active unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      });

      // Save token hash to database
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });

      const clientUrl = config.clientUrl || "http://localhost:3000";
      const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

      // Dispatch password reset email asynchronously
      await EmailService.sendPasswordResetEmail({
        toEmail: user.email,
        userName: user.role === UserRole.SUPER_ADMIN ? "Super Admin" : user.email.split("@")[0],
        resetUrl,
        expiresMinutes: 60
      });
    }

    // Generic response to prevent email enumeration attacks
    return {
      success: true,
      message: "If an account exists with this email address, a password reset link has been sent."
    };
  }

  /**
   * Reset user password using valid token
   */
  static async resetPassword(input: ResetPasswordInput) {
    const { token, newPassword } = input;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!resetTokenRecord || !resetTokenRecord.user) {
      throw new AppError("Invalid or expired password reset token. Please request a new reset link.", HTTP_STATUS.BAD_REQUEST);
    }

    const newHashedPassword = await PasswordUtil.hash(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: {
          passwordHash: newHashedPassword,
          mustChangePassword: false,
          refreshToken: null
        }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() }
      })
    ]);

    return {
      success: true,
      message: "Your password has been successfully reset. You may now log in with your new password."
    };
  }
}
