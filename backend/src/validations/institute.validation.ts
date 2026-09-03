import { z } from "zod";

export const uploadLogoSchema = z.object({
  body: z.object({
    logoData: z
      .string({ required_error: "Logo data or image URL is required" })
      .min(1, "Logo data cannot be empty"),
    fileName: z.string().optional(),
    mimeType: z
      .string()
      .regex(/^image\/(png|jpeg|jpg|webp|svg\+xml)$/i, "Unsupported image format. Allowed formats: PNG, JPEG, WebP, SVG")
      .optional()
  })
});

export type UploadLogoInput = z.infer<typeof uploadLogoSchema>["body"];

export const updateTaglineSchema = z.object({
  body: z.object({
    tagline: z
      .string()
      .max(255, "Tagline / Slogan cannot exceed 255 characters")
      .nullable()
      .optional()
  })
});

export type UpdateTaglineInput = z.infer<typeof updateTaglineSchema>["body"];

export const updateInstituteProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Institute name must be at least 2 characters").optional(),
    phone: z.string().min(6, "Contact phone must be at least 6 digits").optional(),
    address: z.string().nullable().optional(),
    website: z.string().nullable().optional().or(z.literal("")),
    tagline: z.string().max(255, "Tagline / Slogan cannot exceed 255 characters").nullable().optional()
  })
});

export type UpdateInstituteProfileInput = z.infer<typeof updateInstituteProfileSchema>["body"];
