import { Router } from "express";
import { ok } from "../../shared/apiResponse.js";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.json(
    ok({
      data: {
        status: "ok",
        service: "c2c-soporte-backend"
      },
      requestId: req.requestId
    })
  );
});
