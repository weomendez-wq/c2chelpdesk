import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../../shared/appError.js";
import { validateReadOnlySql } from "./sqlSafety.js";

test("validateReadOnlySql acepta SELECT y normaliza espacios externos", () => {
  const sql = validateReadOnlySql("  SELECT * FROM staging_public.documentos LIMIT 10  ");

  assert.equal(sql, "SELECT * FROM staging_public.documentos LIMIT 10");
});

test("validateReadOnlySql acepta WITH de solo lectura", () => {
  const sql = validateReadOnlySql("WITH base AS (SELECT 1) SELECT * FROM base");

  assert.equal(sql, "WITH base AS (SELECT 1) SELECT * FROM base");
});

test("validateReadOnlySql rechaza sentencias que no comienzan con SELECT o WITH", () => {
  assert.throws(
    () => validateReadOnlySql("DROP TABLE public.documentos"),
    (error) => error instanceof AppError && error.code === "SQL_NOT_READ_ONLY"
  );
});

test("validateReadOnlySql rechaza multiples sentencias", () => {
  assert.throws(
    () => validateReadOnlySql("SELECT 1; SELECT 2"),
    (error) => error instanceof AppError && error.code === "SQL_NOT_READ_ONLY"
  );
});

test("validateReadOnlySql rechaza comentarios SQL", () => {
  assert.throws(
    () => validateReadOnlySql("SELECT 1 -- comentario"),
    (error) => error instanceof AppError && error.code === "SQL_NOT_READ_ONLY"
  );
});

test("validateReadOnlySql rechaza comandos peligrosos dentro de CTE", () => {
  assert.throws(
    () => validateReadOnlySql("WITH deleted AS (DELETE FROM public.documentos RETURNING *) SELECT * FROM deleted"),
    (error) => error instanceof AppError && error.code === "SQL_FORBIDDEN_COMMAND"
  );
});
