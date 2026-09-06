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
      throw new Error(error.message || "Failed to submit enquiry. Please try again.");
    }
  }
}
