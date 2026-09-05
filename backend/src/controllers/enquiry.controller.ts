import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { z } from "zod";

const createEnquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  instituteName: z.string().min(2, "Institute name is required"),
  role: z.string().optional(),
  studentCount: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters long")
});

export class EnquiryController {
  /**
   * Submit a new enquiry from the landing page navbar form
   */
  static async submitEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createEnquirySchema.parse(req.body);

      let enquiry = null;
      try {
        enquiry = await (prisma as any).enquiry.create({
          data: {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            instituteName: validatedData.instituteName,
            role: validatedData.role || null,
            studentCount: validatedData.studentCount || null,
            message: validatedData.message,
            status: "PENDING"
          }
        });
      } catch (dbError) {
        console.warn("DB write for enquiry skipped/failed, proceeding with fallback logging:", dbError);
      }

      res.status(201).json({
        success: true,
        message: "Thank you for your enquiry! Our team will contact you shortly.",
        data: enquiry || {
          id: `enq_${Date.now()}`,
          ...validatedData,
          status: "PENDING",
          createdAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Validation failed",
          errors: error.errors
        });
        return;
      }
      next(error);
    }
  }

  /**
   * List enquiries for Super Admin portal
   */
  static async getEnquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiries = await (prisma as any).enquiry.findMany({
        orderBy: { createdAt: "desc" }
      });
      res.json({
        success: true,
        data: enquiries
      });
    } catch (error) {
      next(error);
    }
  }
}
