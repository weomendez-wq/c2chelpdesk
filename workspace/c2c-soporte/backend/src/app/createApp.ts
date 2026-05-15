import cors from "cors";
import express from "express";
import helmet from "helmet";
import { adminSqlRouter } from "../modules/adminSql/adminSql.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { supportRouter } from "../modules/support/support.routes.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import { notFoundHandler } from "../middlewares/notFoundHandler.js";
import { requestIdMiddleware } from "../middlewares/requestId.js";
import { httpLogger } from "../shared/logger.js";

export const createApp = () => {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(httpLogger);
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/admin/sql", adminSqlRouter);
  app.use("/api/support", supportRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
