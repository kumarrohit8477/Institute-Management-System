import { Router } from "express";
import { TestController } from "../controllers/test.controller";
import { AttemptController } from "../controllers/attempt.controller";
import { ResultController } from "../controllers/result.controller";
import { authenticate, authorize, validateRequest } from "../middleware/auth.middleware";
import { resolveTenantContext } from "../middleware/tenant.middleware";
import { enforceFeatureFlag } from "../middleware/quota.middleware";
import {
  createTestSchema,
  updateTestSchema,
  addQuestionsToTestSchema,
  testQuerySchema
} from "../validations/test.validation";
import {
  startAttemptSchema,
  saveAnswerSchema,
  submitAttemptSchema
} from "../validations/attempt.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(resolveTenantContext);

// Student Exam Attempt Lifecycle
router.post(
  "/:testId/start",
  authorize(UserRole.STUDENT),
  validateRequest(startAttemptSchema),
  AttemptController.startAttempt
);

router.post(
  "/:testId/save-answer",
  authorize(UserRole.STUDENT),
  validateRequest(saveAnswerSchema),
  AttemptController.saveAnswer
);

router.post(
  "/:testId/submit",
  authorize(UserRole.STUDENT),
  validateRequest(submitAttemptSchema),
  AttemptController.submitAttempt
);

router.get("/:testId/my-result", authorize(UserRole.STUDENT), ResultController.getTestResult);
router.get("/:testId/leaderboard", ResultController.getTestLeaderboard);

// Test CRUD Operations
router.post(
  "/",
  authorize(UserRole.ADMIN),
  enforceFeatureFlag("hasOnlineCBT"),
  validateRequest(createTestSchema),
  TestController.createTest
);

router.get("/", validateRequest(testQuerySchema), TestController.getTests);

router.get("/:id", TestController.getTestById);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validateRequest(updateTestSchema),
  TestController.updateTest
);

router.post(
  "/:id/questions",
  authorize(UserRole.ADMIN),
  validateRequest(addQuestionsToTestSchema),
  TestController.addQuestionsToTest
);

router.delete(
  "/:id/questions/:questionId",
  authorize(UserRole.ADMIN),
  TestController.removeQuestionFromTest
);

router.delete("/:id", authorize(UserRole.ADMIN), TestController.deleteTest);

export const testRoutes = router;
