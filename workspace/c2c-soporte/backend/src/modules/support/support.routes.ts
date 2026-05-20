import { Router } from "express";
import { ok } from "../../shared/apiResponse.js";
import { AppError } from "../../shared/appError.js";
import {
  alertsQuerySchema,
  cacheRefreshRequestSchema,
  companiesQuerySchema,
  companyControlQuerySchema,
  companyDevicesQuerySchema,
  deviceControlQuerySchema,
  documentsSummaryQuerySchema,
  dteConfigUpdateRequestSchema,
  devicesQuerySchema,
  foliosAlertConfigUpdateRequestSchema,
  folioRangesQuerySchema,
  foliosControlQuerySchema,
  gmailSyncRequestSchema,
  helpdeskEmailIntakeRequestSchema,
  helpdeskManualTicketRequestSchema,
  helpdeskTicketQuerySchema
} from "./support.schemas.js";
import { syncGmailHelpdesk } from "./gmail.service.js";
import {
  createManualHelpdeskTicket,
  getCacheStatus,
  listDteConfig,
  getDocumentsSummary,
  listAlerts,
  listCompanies,
  listCompanyControl,
  listCompanyDevices,
  listDeviceControl,
  listDevices,
  listFolioRanges,
  listFoliosAlertConfig,
  listFoliosControl,
  listHelpdeskTickets,
  intakeSimulatedHelpdeskEmail,
  refreshLocalCaches,
  updateDteConfig,
  updateFoliosAlertConfig
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

supportRouter.get("/control/cache-status", async (req, res, next) => {
  try {
    const data = await getCacheStatus();

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/helpdesk/tickets", async (req, res, next) => {
  try {
    const parsedQuery = helpdeskTicketQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Parametros de tickets invalidos",
        statusCode: 400
      });
    }

    const data = await listHelpdeskTickets(parsedQuery.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.post("/helpdesk/tickets/manual", async (req, res, next) => {
  try {
    const parsedBody = helpdeskManualTicketRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Ticket manual invalido",
        statusCode: 400
      });
    }

    const data = await createManualHelpdeskTicket(parsedBody.data);

    res.status(201).json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.post("/helpdesk/email-intake/simulated", async (req, res, next) => {
  try {
    const parsedBody = helpdeskEmailIntakeRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Correo simulado invalido",
        statusCode: 400
      });
    }

    const data = await intakeSimulatedHelpdeskEmail(parsedBody.data);

    res.status(data.duplicate ? 200 : 201).json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.post("/helpdesk/email-intake/gmail/sync", async (req, res, next) => {
  try {
    const parsedBody = gmailSyncRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Solicitud de sincronizacion Gmail invalida",
        statusCode: 400
      });
    }

    const data = await syncGmailHelpdesk(parsedBody.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/control/maintainers/dte-config", async (req, res, next) => {
  try {
    const data = await listDteConfig();

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.patch("/control/maintainers/dte-config/:configId", async (req, res, next) => {
  try {
    const configId = Number(req.params.configId);

    if (!Number.isInteger(configId) || configId <= 0) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Identificador de configuracion invalido",
        statusCode: 400
      });
    }

    const parsedBody = dteConfigUpdateRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Configuracion DTE invalida",
        statusCode: 400
      });
    }

    const data = await updateDteConfig(configId, parsedBody.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.get("/control/maintainers/folios-alert-config", async (req, res, next) => {
  try {
    const data = await listFoliosAlertConfig();

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.patch("/control/maintainers/folios-alert-config/:configId", async (req, res, next) => {
  try {
    const configId = Number(req.params.configId);

    if (!Number.isInteger(configId) || configId <= 0) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Identificador de umbral invalido",
        statusCode: 400
      });
    }

    const parsedBody = foliosAlertConfigUpdateRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Configuracion de umbrales invalida",
        statusCode: 400
      });
    }

    const data = await updateFoliosAlertConfig(configId, parsedBody.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});

supportRouter.post("/control/cache-refresh", async (req, res, next) => {
  try {
    const parsedBody = cacheRefreshRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Confirmacion de refresco invalida",
        statusCode: 400
      });
    }

    const data = await refreshLocalCaches(parsedBody.data);

    res.json(ok({ data, requestId: req.requestId }));
  } catch (error) {
    next(error);
  }
});
