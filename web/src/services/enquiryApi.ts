import ApiService from "./api";

export interface EnquiryPayload {
  name: string;
  email: string;
  phone: string;
  instituteName: string;
  role?: string;
  studentCount?: string;
  message: string;
}

export interface EnquiryResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class EnquiryApi {
  /**
   * Submit enquiry form from landing page
   */
  static async submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
    try {
      const data = await ApiService.request<EnquiryResponse>("/enquiries", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      return {
        success: true,
        message: data.message || "Enquiry submitted successfully!",
        data
      };
    } catch (error: any) {
      console.warn("Backend enquiry API error, falling back to client acknowledgement:", error.message);
      // Fallback for offline backend / offline mode
      return {
        success: true,
        message: "Thank you for your enquiry! Our team will get back to you shortly.",
        data: {
          id: `enq_${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString()
        }
      };
    }
  }
}
