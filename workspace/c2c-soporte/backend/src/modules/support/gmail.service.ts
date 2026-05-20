import { env } from "../../config/env.js";
import { AppError } from "../../shared/appError.js";
import type { GmailSyncRequest } from "./support.schemas.js";
import { intakeSimulatedHelpdeskEmail, type HelpdeskEmailIntakeResult } from "./support.service.js";

type GmailTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GmailListResponse = {
  messages?: Array<{ id: string; threadId: string }>;
};

type GmailHeader = {
  name: string;
  value: string;
};

type GmailMessagePart = {
  body?: {
    data?: string;
  };
  mimeType?: string;
  parts?: GmailMessagePart[];
};

type GmailMessage = {
  id: string;
  internalDate?: string;
  payload?: GmailMessagePart & {
    headers?: GmailHeader[];
  };
  snippet?: string;
  threadId: string;
};

export type GmailSyncResult = {
  enabled: boolean;
  mailbox: string | null;
  processed: number;
  created: number;
  duplicates: number;
  skipped: number;
  items: Array<{
    duplicate?: boolean;
    emailMessageId?: number;
    gmailId: string;
    messageId: string;
    subject: string;
    ticketNumber?: number;
  }>;
};

const assertGmailConfigured = () => {
  if (!env.GMAIL_ENABLED) {
    throw new AppError({
      code: "GMAIL_DISABLED",
      message: "La sincronizacion Gmail esta desactivada en la configuracion local",
      statusCode: 409
    });
  }

  if (
    !env.GMAIL_CLIENT_ID ||
    !env.GMAIL_CLIENT_SECRET ||
    !env.GMAIL_REFRESH_TOKEN ||
    !env.GMAIL_SUPPORT_MAILBOX
  ) {
    throw new AppError({
      code: "GMAIL_NOT_CONFIGURED",
      message: "Faltan variables OAuth de Gmail para sincronizar la casilla de soporte",
      statusCode: 409
    });
  }
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  return Buffer.from(padded, "base64").toString("utf8");
};

const getHeader = (headers: GmailHeader[] | undefined, name: string) =>
  headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value;

const collectTextParts = (part: GmailMessagePart | undefined): string[] => {
  if (!part) {
    return [];
  }

  const current =
    part.mimeType === "text/plain" && part.body?.data ? [decodeBase64Url(part.body.data)] : [];

  return [...current, ...(part.parts ?? []).flatMap(collectTextParts)];
};

const fetchGmailAccessToken = async () => {
  assertGmailConfigured();

  const body = new URLSearchParams({
    client_id: env.GMAIL_CLIENT_ID!,
    client_secret: env.GMAIL_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: env.GMAIL_REFRESH_TOKEN!
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  });
  const payload = (await response.json()) as GmailTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new AppError({
      code: "GMAIL_TOKEN_ERROR",
      message: payload.error_description ?? payload.error ?? "No se pudo obtener token Gmail",
      statusCode: 502
    });
  }

  return payload.access_token;
};

const gmailFetch = async <TPayload>(path: string, accessToken: string): Promise<TPayload> => {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new AppError({
      code: "GMAIL_API_ERROR",
      message: `Gmail API respondio ${response.status}`,
      statusCode: 502
    });
  }

  return (await response.json()) as TPayload;
};

const defaultGmailQuery = () =>
  [
    "in:inbox",
    `-label:${env.GMAIL_LABEL_PROCESSED}`,
    `-label:${env.GMAIL_LABEL_REVIEW}`,
    "newer_than:30d"
  ].join(" ");

const normalizeGmailMessage = (message: GmailMessage, requestedBy: string) => {
  const headers = message.payload?.headers ?? [];
  const fromHeader = getHeader(headers, "From") ?? env.GMAIL_SUPPORT_MAILBOX ?? "desconocido@example.com";
  const subject = getHeader(headers, "Subject") ?? "(Sin asunto)";
  const messageId = getHeader(headers, "Message-ID") ?? `gmail:${message.id}`;
  const replyTo = getHeader(headers, "Reply-To");
  const bodyText = collectTextParts(message.payload).join("\n\n").trim() || message.snippet || subject;
  const emailMatch = fromHeader.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const fromEmail = emailMatch?.[0] ?? fromHeader;
  const fromName = fromHeader.replace(`<${fromEmail}>`, "").replace(fromEmail, "").replace(/"/g, "").trim();

  return {
    bodyText,
    confirm: "SIMULATE_EMAIL_INTAKE" as const,
    conversationId: message.threadId,
    fromEmail,
    fromName: fromName || undefined,
    mailbox: env.GMAIL_SUPPORT_MAILBOX,
    messageId,
    priorityCode: "MEDIUM",
    receivedAt: message.internalDate
      ? new Date(Number(message.internalDate)).toISOString()
      : new Date().toISOString(),
    replyTo: replyTo?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0],
    requestedBy,
    subject
  };
};

export const syncGmailHelpdesk = async (input: GmailSyncRequest): Promise<GmailSyncResult> => {
  const accessToken = await fetchGmailAccessToken();
  const query = encodeURIComponent(input.query ?? defaultGmailQuery());
  const list = await gmailFetch<GmailListResponse>(
    `messages?maxResults=${input.maxResults}&q=${query}`,
    accessToken
  );
  const messages = list.messages ?? [];
  const items: GmailSyncResult["items"] = [];
  let created = 0;
  let duplicates = 0;
  let skipped = 0;

  for (const messageRef of messages) {
    const message = await gmailFetch<GmailMessage>(
      `messages/${messageRef.id}?format=full`,
      accessToken
    );
    const intakeInput = normalizeGmailMessage(message, input.requestedBy);
    let intakeResult: HelpdeskEmailIntakeResult;

    try {
      intakeResult = await intakeSimulatedHelpdeskEmail(intakeInput);
    } catch (error) {
      skipped += 1;
      continue;
    }

    if (intakeResult.duplicate) {
      duplicates += 1;
    } else {
      created += 1;
    }

    items.push({
      duplicate: intakeResult.duplicate,
      emailMessageId: intakeResult.emailMessageId,
      gmailId: message.id,
      messageId: intakeInput.messageId ?? `gmail:${message.id}`,
      subject: intakeInput.subject,
      ticketNumber: intakeResult.ticket.ticketNumber
    });
  }

  return {
    created,
    duplicates,
    enabled: env.GMAIL_ENABLED,
    items,
    mailbox: env.GMAIL_SUPPORT_MAILBOX ?? null,
    processed: messages.length,
    skipped
  };
};
