import { AppError } from "../../shared/appError.js";

const forbiddenCommands = [
  "insert",
  "update",
  "delete",
  "truncate",
  "drop",
  "alter",
  "create",
  "grant",
  "revoke",
  "copy",
  "call",
  "do",
  "execute"
] as const;

const forbiddenCommandPattern = new RegExp(`\\b(${forbiddenCommands.join("|")})\\b`, "i");

export const validateReadOnlySql = (sql: string): string => {
  const normalizedSql = sql.trim();
  const lowerSql = normalizedSql.toLowerCase();

  if (!lowerSql.startsWith("select") && !lowerSql.startsWith("with")) {
    throw new AppError({
      code: "SQL_NOT_READ_ONLY",
      message: "Solo se permiten consultas SELECT o WITH",
      statusCode: 400
    });
  }

  if (normalizedSql.includes(";")) {
    throw new AppError({
      code: "SQL_NOT_READ_ONLY",
      message: "No se permiten multiples sentencias SQL",
      statusCode: 400
    });
  }

  if (normalizedSql.includes("--") || normalizedSql.includes("/*") || normalizedSql.includes("*/")) {
    throw new AppError({
      code: "SQL_NOT_READ_ONLY",
      message: "No se permiten comentarios SQL en esta version",
      statusCode: 400
    });
  }

  const forbiddenMatch = lowerSql.match(forbiddenCommandPattern);
  if (forbiddenMatch) {
    throw new AppError({
      code: "SQL_FORBIDDEN_COMMAND",
      message: `Comando SQL bloqueado: ${forbiddenMatch[1]?.toUpperCase()}`,
      statusCode: 400
    });
  }

  return normalizedSql;
};
