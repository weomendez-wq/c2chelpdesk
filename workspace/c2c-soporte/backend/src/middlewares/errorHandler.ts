import type { ErrorRequestHandler } from "express";
import { fail } from "../shared/apiResponse.js";
import { logger } from "../shared/logger.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  logger.error({ error, requestId: req.requestId }, "error no controlado");

  res.status(500).json(
    fail({
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor",
      requestId: req.requestId
    })
  );
};
