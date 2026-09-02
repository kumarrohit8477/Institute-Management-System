import { Router } from "express";
import { SubjectController } from "../controllers/subject.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { createSubjectSchema, updateSubjectSchema, subjectQuerySchema } from "../validations/subject.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createSubjectSchema),
  SubjectController.createSubject
);

router.get("/", validateRequest(subjectQuerySchema), SubjectController.getSubjects);

router.get("/:id", SubjectController.getSubjectById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateSubjectSchema),
  SubjectController.updateSubject
);

export const subjectRoutes = router;
