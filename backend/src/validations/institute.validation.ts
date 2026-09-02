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
