import { sendSheetTickets, type SheetTicketRow } from "../modules/support/sheets.service.js";
import { AppError } from "../shared/appError.js";

type CliOptions = {
  requestedBy: string;
};

const parseArgs = (args: string[]): CliOptions => {
  const options: CliOptions = {
    requestedBy: "sheet-test-cli"
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--requested-by" && next) {
      options.requestedBy = next;
      index += 1;
    }
  }

  return options;
};

const buildTestRow = (): SheetTicketRow => {
  const now = new Date().toISOString();
  const suffix = now.replace(/[-:.TZ]/g, "").slice(0, 14);

  return {
    canal_origen: "Email",
    cli_nombre: "PRUEBA C2C",
    cli_rut: "",
    contacto_cliente: "Prueba Apps Script",
    email_contacto: "prueba-helpdesk@example.com",
    estado_ingesta: "PENDIENTE_REVISION",
    estado_ticket: "Abierto",
    fecha_ingesta: now,
    fecha_modificacion: now,
    fecha_recepcion: now.slice(0, 10),
    fecha_solicitud: now.slice(0, 10),
    gmail_id: `manual-test-${suffix}`,
    hora_inicio: now.slice(11, 19),
    hora_termino: "",
    message_id_gmail: `manual-test-${suffix}@c2c-soporte.local`,
    observacion: "Fila de prueba enviada desde backend para validar Apps Script.",
    prioridad: "Media",
    subject: "PRUEBA HELPDESK C2C",
    thread_id_gmail: `manual-thread-${suffix}`
  };
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const row = buildTestRow();
  const result = await sendSheetTickets([row], options.requestedBy);

  console.log(
    JSON.stringify(
      {
        ok: true,
        data: {
          result,
          testMessageId: row.message_id_gmail
        }
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
      process.exitCode = error.code === "SHEETS_DISABLED" ? 0 : 1;
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
