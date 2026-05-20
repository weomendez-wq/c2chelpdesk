import { env } from "../../config/env.js";
import { AppError } from "../../shared/appError.js";
import type { NormalizedGmailHelpdeskMessage } from "./gmail.service.js";

export type SheetTicketRow = {
  canal_origen: "Email";
  cli_nombre: string;
  cli_rut: string;
  contacto_cliente: string;
  email_contacto: string;
  estado_ingesta: "PENDIENTE_REVISION";
  estado_ticket: "Abierto";
  fecha_ingesta: string;
  fecha_modificacion: string;
  fecha_recepcion: string;
  fecha_solicitud: string;
  gmail_id: string;
  hora_inicio: string;
  hora_termino: string;
  message_id_gmail: string;
  observacion: string;
  prioridad: "Media";
  subject: string;
  thread_id_gmail: string;
};

export type SheetAppendResult = {
  appended: number;
  duplicates: number;
  received: number;
  skipped: number;
};

type AppsScriptResponse = {
  data?: Partial<SheetAppendResult>;
  error?: {
    code?: string;
    message?: string;
  };
  ok?: boolean;
};

const assertSheetsConfigured = () => {
  if (!env.GOOGLE_SHEETS_HELPDESK_ENABLED) {
    throw new AppError({
      code: "SHEETS_DISABLED",
      message: "El envio a la planilla Helpdesk esta desactivado en la configuracion local",
      statusCode: 409
    });
  }

  if (!env.GOOGLE_SHEETS_HELPDESK_WEBAPP_URL || !env.GOOGLE_SHEETS_HELPDESK_TOKEN) {
    throw new AppError({
      code: "SHEETS_NOT_CONFIGURED",
      message: "Faltan URL o token del Web App de Apps Script para enviar tickets",
      statusCode: 409
    });
  }
};

const toDateParts = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: "",
      time: ""
    };
  }

  return {
    date: date.toISOString().slice(0, 10),
    time: date.toISOString().slice(11, 19)
  };
};

const compactText = (value: string, maxLength: number) =>
  value.replace(/\s+/g, " ").trim().slice(0, maxLength);

export const mapGmailMessageToSheetTicket = (
  message: NormalizedGmailHelpdeskMessage
): SheetTicketRow => {
  const received = toDateParts(message.receivedAt);
  const now = new Date().toISOString();
  const bodyPreview = compactText(message.bodyText, 900);

  return {
    canal_origen: "Email",
    cli_nombre: "",
    cli_rut: "",
    contacto_cliente: message.fromName ?? "",
    email_contacto: message.fromEmail,
    estado_ingesta: "PENDIENTE_REVISION",
    estado_ticket: "Abierto",
    fecha_ingesta: now,
    fecha_modificacion: now,
    fecha_recepcion: received.date,
    fecha_solicitud: received.date,
    gmail_id: message.gmailId,
    hora_inicio: received.time,
    hora_termino: "",
    message_id_gmail: message.messageId,
    observacion: bodyPreview || message.subject,
    prioridad: "Media",
    subject: message.subject,
    thread_id_gmail: message.threadId
  };
};

export const sendSheetTickets = async (
  rows: SheetTicketRow[],
  requestedBy: string
): Promise<SheetAppendResult> => {
  assertSheetsConfigured();

  const response = await fetch(env.GOOGLE_SHEETS_HELPDESK_WEBAPP_URL!, {
    body: JSON.stringify({
      requestedBy,
      rows,
      targetSheet: "INFO_TICKETS_SOPORTE",
      token: env.GOOGLE_SHEETS_HELPDESK_TOKEN
    }),
    headers: {
      "content-type": "application/json"
    },
    method: "POST"
  });

  const payload = (await response.json()) as AppsScriptResponse;

  if (!response.ok || payload.ok !== true) {
    throw new AppError({
      code: payload.error?.code ?? "SHEETS_WEBAPP_ERROR",
      message: payload.error?.message ?? `Apps Script respondio ${response.status}`,
      statusCode: 502
    });
  }

  return {
    appended: payload.data?.appended ?? 0,
    duplicates: payload.data?.duplicates ?? 0,
    received: payload.data?.received ?? rows.length,
    skipped: payload.data?.skipped ?? 0
  };
};
