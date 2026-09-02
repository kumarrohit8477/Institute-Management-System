import { Request, Response } from "express";
import { SaasService } from "../services/saas.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export class SaasController {
  static getPlatformOverview = asyncHandler(async (req: Request, res: Response) => {
    const overview = await SaasService.getPlatformOverview();
    return ResponseHandler.success(res, overview, "Platform overview metrics retrieved successfully");
  });

  static onboardInstitute = asyncHandler(async (req: Request, res: Response) => {
    const result = await SaasService.onboardInstituteTenant(req.body);
    return ResponseHandler.created(res, result, "Institute tenant onboarded successfully with admin credentials");
  });

  static getAllInstitutes = asyncHandler(async (req: Request, res: Response) => {
    const result = await SaasService.getAllInstitutes(req.query as any);
    return ResponseHandler.success(res, result.institutes, "Institute tenants retrieved successfully", 200, result.meta);
  });

  static getInstituteById = asyncHandler(async (req: Request, res: Response) => {
    const institute = await SaasService.getInstituteById(req.params.id);
    return ResponseHandler.success(res, institute, "Institute tenant profile retrieved successfully");
  });

  static updateInstitute = asyncHandler(async (req: Request, res: Response) => {
    const updated = await SaasService.updateInstituteTenant(req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Institute tenant updated successfully");
  });

  static updateInstituteStatus = asyncHandler(async (req: Request, res: Response) => {
    const updated = await SaasService.updateInstituteStatus(req.params.id, req.body.status);
    return ResponseHandler.success(res, updated, `Institute status changed to ${req.body.status}`);
  });

  static getSubscriptionPlans = asyncHandler(async (req: Request, res: Response) => {
    const plans = await SaasService.getSubscriptionPlans();
    return ResponseHandler.success(res, plans, "Subscription plans retrieved successfully");
  });

  static updateSubscriptionPlan = asyncHandler(async (req: Request, res: Response) => {
    const updated = await SaasService.updateSubscriptionPlan(req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Subscription plan updated successfully");
  });

  static changeInstituteSubscription = asyncHandler(async (req: Request, res: Response) => {
    const result = await SaasService.changeInstituteSubscription(req.params.id, req.body);
    return ResponseHandler.success(res, result, "Institute subscription plan updated successfully");
  });

  static getPlatformInvoices = asyncHandler(async (req: Request, res: Response) => {
    const result = await SaasService.getPlatformInvoices(req.query as any);
    return ResponseHandler.success(res, result.invoices, "Platform invoices retrieved successfully", 200, result.meta);
  });

  static recordInvoicePayment = asyncHandler(async (req: Request, res: Response) => {
    const { paymentMethod, transactionReference } = req.body || {};
    const invoice = await SaasService.recordInvoicePayment(req.params.id, paymentMethod, transactionReference);
    return ResponseHandler.success(res, invoice, "Platform invoice marked as paid and subscription activated");
  });
}
