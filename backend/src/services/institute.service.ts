import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { UploadLogoInput, UpdateInstituteProfileInput } from "../validations/institute.validation";
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

export class InstituteService {
  /**
   * Ensure the uploads/logos directory exists
   */
  private static ensureUploadDir(): string {
    const uploadDir = path.join(process.cwd(), "uploads", "logos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }

  /**
   * Helper to delete an existing logo file on disk if it was stored locally
   */
  private static removeOldLogoFile(logoUrl?: string | null) {
    if (!logoUrl) return;
    try {
      if (logoUrl.startsWith("/uploads/logos/")) {
        const relativePath = logoUrl.replace(/^\//, "");
        const fullPath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    } catch (e) {
      console.warn("Failed to delete previous logo file:", e);
    }
  }

  /**
   * Fetch current institute information
   */
  static async getCurrentInstitute(instituteId: string) {
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      include: {
        subscription: {
          include: { plan: true }
        },
        tenantUsage: true,
        _count: {
          select: {
            students: true,
            teachers: true,
            courses: true,
            batches: true,
            rooms: true,
            users: true
          }
        }
      }
    });

    if (!institute) {
      throw new AppError("Institute not found", HTTP_STATUS.NOT_FOUND);
    }

    return {
      id: institute.id,
      name: institute.name,
      code: institute.code,
      customDomain: institute.customDomain,
      email: institute.email,
      phone: institute.phone,
      address: institute.address,
      logoUrl: institute.logoUrl,
      tagline: institute.tagline,
      website: institute.website,
      status: institute.status,
      settings: institute.settings,
      createdAt: institute.createdAt,
      updatedAt: institute.updatedAt,
      subscription: institute.subscription,
      tenantUsage: institute.tenantUsage,
      _count: institute._count
    };
  }

  /**
   * Upload or update institute logo
   */
  static async updateLogo(instituteId: string, input: UploadLogoInput) {
    const { logoData, mimeType: inputMime } = input;

    const institute = await prisma.institute.findUnique({
      where: { id: instituteId }
    });

    if (!institute) {
      throw new AppError("Institute not found", HTTP_STATUS.NOT_FOUND);
    }

    let finalLogoUrl: string;

    // Check if input is a direct HTTP/HTTPS URL
    if (logoData.startsWith("http://") || logoData.startsWith("https://")) {
      finalLogoUrl = logoData;
      // Remove old local file if switching to external URL
      InstituteService.removeOldLogoFile(institute.logoUrl);
    } else {
      // Process Base64 data URI or raw base64 string
      let mimeType = inputMime || "image/png";
      let base64Payload = logoData;

      if (logoData.startsWith("data:")) {
        const match = logoData.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1].toLowerCase();
          base64Payload = match[2];
        }
      }

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new AppError(
          `Unsupported image format (${mimeType}). Allowed formats are: PNG, JPEG, WebP, SVG`,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const buffer = Buffer.from(base64Payload, "base64");

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new AppError(
          `Logo image exceeds maximum allowed size of 5 MB (provided size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      // Map extension from MIME type
      let ext = "png";
      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
      else if (mimeType.includes("webp")) ext = "webp";
      else if (mimeType.includes("svg")) ext = "svg";

      const uploadDir = InstituteService.ensureUploadDir();
      const fileName = `logo-${instituteId}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);

      // Clean up previous disk logo
      InstituteService.removeOldLogoFile(institute.logoUrl);

      finalLogoUrl = `/uploads/logos/${fileName}`;
    }

    // Update database
    const updated = await prisma.institute.update({
      where: { id: instituteId },
      data: { logoUrl: finalLogoUrl }
    });

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      logoUrl: updated.logoUrl,
      tagline: updated.tagline,
      updatedAt: updated.updatedAt
    };
  }

  /**
   * Remove/Delete institute logo
   */
  static async deleteLogo(instituteId: string) {
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId }
    });

    if (!institute) {
      throw new AppError("Institute not found", HTTP_STATUS.NOT_FOUND);
    }

    InstituteService.removeOldLogoFile(institute.logoUrl);

    const updated = await prisma.institute.update({
      where: { id: instituteId },
      data: { logoUrl: null }
    });

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      logoUrl: null,
      tagline: updated.tagline,
      updatedAt: updated.updatedAt
    };
  }

  /**
   * Update or clear institute tagline / slogan
   */
  static async updateTagline(instituteId: string, tagline?: string | null) {
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId }
    });

    if (!institute) {
      throw new AppError("Institute not found", HTTP_STATUS.NOT_FOUND);
    }

    const cleanTagline = tagline?.trim() ? tagline.trim() : null;

    const updated = await prisma.institute.update({
      where: { id: instituteId },
      data: { tagline: cleanTagline }
    });

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      logoUrl: updated.logoUrl,
      tagline: updated.tagline,
      updatedAt: updated.updatedAt
    };
  }

  /**
   * Update institute profile / contact details
   */
  static async updateProfile(instituteId: string, input: UpdateInstituteProfileInput) {
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId }
    });

    if (!institute) {
      throw new AppError("Institute not found", HTTP_STATUS.NOT_FOUND);
    }

    const dataToUpdate: any = {};
    if (input.name !== undefined) dataToUpdate.name = input.name.trim();
    if (input.phone !== undefined) dataToUpdate.phone = input.phone.trim();
    if (input.address !== undefined) dataToUpdate.address = input.address?.trim() || null;
    if (input.website !== undefined) dataToUpdate.website = input.website?.trim() || null;
    if (input.tagline !== undefined) dataToUpdate.tagline = input.tagline?.trim() || null;

    const updated = await prisma.institute.update({
      where: { id: instituteId },
      data: dataToUpdate,
      include: {
        subscription: {
          include: { plan: true }
        },
        tenantUsage: true,
        _count: {
          select: {
            students: true,
            teachers: true,
            courses: true,
            batches: true,
            rooms: true,
            users: true
          }
        }
      }
    });

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      customDomain: updated.customDomain,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      logoUrl: updated.logoUrl,
      tagline: updated.tagline,
      website: updated.website,
      status: updated.status,
      settings: updated.settings,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      subscription: updated.subscription,
      tenantUsage: updated.tenantUsage,
      _count: updated._count
    };
  }
}
