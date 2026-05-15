import pino from "pino";
import { pinoHttp } from "pino-http";
import type { Request, Response } from "express";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    remove: true
  }
});

export const httpLogger = pinoHttp<Request, Response>({
  logger,
  genReqId: (req: Request) => req.requestId,
  customProps: (req: Request) => ({
    requestId: req.requestId
  })
});
