import { Router } from "express";
import { TimetableController } from "../controllers/timetable.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import {
  createTimetableSchema,
  updateTimetableSchema,
  timetableQuerySchema
} from "../validations/timetable.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Student Endpoint: Personalized Schedule
router.get("/my", authorize(UserRole.STUDENT), TimetableController.getMySchedule);

// Admin Endpoints
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createTimetableSchema),
  TimetableController.createTimetable
);

router.get("/", validateRequest(timetableQuerySchema), TimetableController.getTimetables);

router.get("/:id", TimetableController.getTimetableById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateTimetableSchema),
  TimetableController.updateTimetable
);

router.delete("/:id", authorize(UserRole.ADMIN), TimetableController.deleteTimetable);

export const timetableRoutes = router;
