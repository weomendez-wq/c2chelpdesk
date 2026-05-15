import { dbPool } from "../../config/database.js";
import { AppError } from "../../shared/appError.js";
import { validateReadOnlySql } from "./sqlSafety.js";
import { summarizePlan } from "./planSummary.js";

export type ExplainResult = {
  plan: unknown[];
  summary: {
    hasSeqScan: boolean;
    seqScanNodes: string[];
  };
};

export const runExplain = async (sql: string): Promise<ExplainResult> => {
  const normalizedSql = validateReadOnlySql(sql);

  try {
    const result = await dbPool.query<{ "QUERY PLAN": unknown[] }>(
      `EXPLAIN (FORMAT JSON) ${normalizedSql}`
    );
    const plan = result.rows[0]?.["QUERY PLAN"] ?? [];

    return {
      plan,
      summary: summarizePlan(plan)
    };
  } catch (error) {
    throw new AppError({
      code: "SQL_EXPLAIN_FAILED",
      message: "No se pudo ejecutar EXPLAIN sobre la consulta",
      statusCode: 400
    });
  }
};
