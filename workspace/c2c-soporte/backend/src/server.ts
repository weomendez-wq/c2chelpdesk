import { createApp } from "./app/createApp.js";
import { env } from "./config/env.js";
import { logger } from "./shared/logger.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "backend iniciado");
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info({ signal }, "cerrando backend");
  server.close((error) => {
    if (error) {
      logger.error({ error }, "error al cerrar backend");
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
