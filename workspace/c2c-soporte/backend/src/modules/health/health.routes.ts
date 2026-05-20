import { Router } from "express";
import { dbPool } from "../../config/database.js";
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

healthRouter.get("/deep", async (req, res, next) => {
  try {
    const result = await dbPool.query<{
      database_name: string;
      server_port: number;
    }>("select current_database() as database_name, inet_server_port() as server_port");

    res.json(
      ok({
        data: {
          status: "ok",
          service: "c2c-soporte-backend",
          database: {
            status: "ok",
            name: result.rows[0]?.database_name ?? null,
            port: result.rows[0]?.server_port ?? null
          }
        },
        requestId: req.requestId
      })
    );
  } catch (error) {
    next(error);
  }
});
