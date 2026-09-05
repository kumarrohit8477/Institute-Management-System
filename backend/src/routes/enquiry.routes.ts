import { Router } from "express";
import { EnquiryController } from "../controllers/enquiry.controller";

const router = Router();

// Public route for submitting landing page enquiries
router.post("/", EnquiryController.submitEnquiry);

// Optional route for fetching enquiries
router.get("/", EnquiryController.getEnquiries);

export const enquiryRoutes = router;
