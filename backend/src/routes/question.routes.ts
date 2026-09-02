import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import {
  createQuestionSchema,
  updateQuestionSchema,
  questionQuerySchema
} from "../validations/question.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Admin-only Question Bank operations
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(createQuestionSchema),
  QuestionController.createQuestion
);

router.get(
  "/",
  authorize(UserRole.ADMIN),
  validateRequest(questionQuerySchema),
  QuestionController.getQuestions
);

router.get("/:id", authorize(UserRole.ADMIN), QuestionController.getQuestionById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateQuestionSchema),
  QuestionController.updateQuestion
);

router.delete("/:id", authorize(UserRole.ADMIN), QuestionController.deleteQuestion);

export const questionRoutes = router;
