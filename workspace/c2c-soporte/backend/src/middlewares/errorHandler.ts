import type { ErrorRequestHandler } from "express";
import { fail } from "../shared/apiResponse.js";
import { AppError } from "../shared/appError.js";
import { logger } from "../shared/logger.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(
      fail({
        code: error.code,
        message: error.message,
        requestId: req.requestId
      })
    );
    return;
  }

  logger.error({ error, requestId: req.requestId }, "error no controlado");

  res.status(500).json(
    fail({
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor",
      requestId: req.requestId
    })
  );
};
