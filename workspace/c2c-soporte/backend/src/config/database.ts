import pg from "pg";
import { env } from "./env.js";

export const dbPool = new pg.Pool({
  connectionString: env.DATABASE_URL
});
