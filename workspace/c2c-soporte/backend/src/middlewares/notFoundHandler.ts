import type { Request, Response } from "express";
import { fail } from "../shared/apiResponse.js";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(
    fail({
      code: "NOT_FOUND",
      message: "Ruta no encontrada",
      requestId: req.requestId
    })
  );
};
