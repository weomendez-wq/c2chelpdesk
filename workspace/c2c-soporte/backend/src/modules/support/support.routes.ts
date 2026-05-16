import { Router } from "express";
import { ok } from "../../shared/apiResponse.js";
import { AppError } from "../../shared/appError.js";
import {
  alertsQuerySchema,
  companiesQuerySchema,
  companyControlQuerySchema,
  companyDevicesQuerySchema,
  deviceControlQuerySchema,
  documentsSummaryQuerySchema,
  devicesQuerySchema,
  folioRangesQuerySchema,
  foliosControlQuerySchema
} from "./support.schemas.js";
import {
  getDocumentsSummary,
  listAlerts,
  listCompanies,
  listCompanyControl,
  listCompanyDevices,
  listDeviceControl,
  listDevices,
  listFolioRanges,
  listFoliosControl
} from "./support.service.js";

export const supportRouter = Router();

supportRouter.get("/companies", async (req, res, next) => {
  try {
    const parsedQuery = companiesQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await listCompanies(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/devices", async (req, res, next) => {
  try {
    const parsedQuery = devicesQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await listDevices(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/company-devices", async (req, res, next) => {
  try {
    const parsedQuery = companyDevicesQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await listCompanyDevices(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/control/companies", async (req, res, next) => {
  try {
    const parsedQuery = companyControlQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await listCompanyControl(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/control/documents-summary", async (req, res, next) => {
  try {
    const parsedQuery = documentsSummaryQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await getDocumentsSummary(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/control/devices", async (req, res, next) => {
  try {
    const parsedQuery = deviceControlQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await listDeviceControl(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/control/folios", async (req, res, next) => {
  try {
    const parsedQuery = foliosControlQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await listFoliosControl(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/control/folio-ranges", async (req, res, next) => {
  try {
    const parsedQuery = folioRangesQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await listFolioRanges(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/control/alerts", async (req, res, next) => {
  try {
    const parsedQuery = alertsQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de consulta invalidos",
        statusCode: 400
      });
    }

    const data = await listAlerts(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});
