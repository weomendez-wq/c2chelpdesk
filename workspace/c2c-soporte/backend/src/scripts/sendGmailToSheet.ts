import { listGmailHelpdeskMessages } from "../modules/support/gmail.service.js";
import { mapGmailMessageToSheetTicket, sendSheetTickets } from "../modules/support/sheets.service.js";
import { AppError } from "../shared/appError.js";

type CliOptions = {
  dryRun: boolean;
  maxResults: number;
  query?: string;
  requestedBy: string;
};

const parseArgs = (args: string[]): CliOptions => {
  const options: CliOptions = {
    dryRun: false,
    maxResults: 1,
    requestedBy: "gmail-sheet-cli"
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if ((arg === "--max" || arg === "--max-results") && next) {
      options.maxResults = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--query" && next) {
      options.query = next;
      index += 1;
      continue;
    }

    if (arg === "--requested-by" && next) {
      options.requestedBy = next;
      index += 1;
    }
  }

  if (!Number.isInteger(options.maxResults) || options.maxResults < 1 || options.maxResults > 10) {
    throw new AppError({
      code: "CLI_VALIDATION_ERROR",
      message: "--max debe ser un entero entre 1 y 10 para el envio a planilla",
      statusCode: 400
    });
  }

  return options;
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const messages = await listGmailHelpdeskMessages({
    confirm: "SYNC_GMAIL_HELPDESK",
    maxResults: options.maxResults,
    query: options.query,
    requestedBy: options.requestedBy
  });
  const rows = messages.map(mapGmailMessageToSheetTicket);

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          data: {
            dryRun: true,
            rows
          }
        },
        null,
        2
      )
    );
    return;
  }

  const result = await sendSheetTickets(rows, options.requestedBy);

  console.log(
    JSON.stringify(
      {
        ok: true,
        data: result
      },
      null,
      2
    )
  );
};

run()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error: unknown) => {
    if (error instanceof AppError) {
      console.error(
        JSON.stringify(
          {
            ok: false,
            error: {
              code: error.code,
              message: error.message
            }
          },
          null,
          2
        )
      );
      process.exitCode = ["GMAIL_DISABLED", "SHEETS_DISABLED"].includes(error.code) ? 0 : 1;
      return;
    }

    console.error(
      JSON.stringify(
        {
          ok: false,
          error: {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Error inesperado"
          }
        },
        null,
        2
      )
    );
    process.exitCode = 1;
  });
