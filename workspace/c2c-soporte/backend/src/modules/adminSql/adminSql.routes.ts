import { Router } from "express";
import { ok } from "../../shared/apiResponse.js";
import { runExplain } from "./adminSql.service.js";
import { explainRequestSchema } from "./adminSql.schemas.js";
import { AppError } from "../../shared/appError.js";

export const adminSqlRouter = Router();

adminSqlRouter.post("/explain", async (req, res, next) => {
  try {
    const parsedBody = explainRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Solicitud SQL invalida",
        statusCode: 400
      });
    }

    const result = await runExplain(parsedBody.data.sql);

    res.json(
      ok({
        data: result,
        requestId: req.requestId
      })
    );
  } catch (error) {
    next(error);
  }
});
