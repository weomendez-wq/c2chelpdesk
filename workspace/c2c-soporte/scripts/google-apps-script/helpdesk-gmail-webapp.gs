const TARGET_SHEET_NAME = "INFO_TICKETS_SOPORTE";
const TOKEN_PROPERTY_NAME = "HELPDESK_WEBAPP_TOKEN";

const REQUIRED_HEADERS = [
  "ticket_id",
  "fecha_creacion",
  "fecha_modificacion",
  "fecha_solicitud",
  "hora_inicio",
  "hora_termino",
  "cli_rut",
  "cli_nombre",
  "contacto_cliente",
  "email_contacto",
  "telefono_contacto",
  "ubicacion_id",
  "mod_id",
  "tipo_ticket_id",
  "usr_responsable_id",
  "estado_ticket",
  "observacion",
  "message_id_gmail",
  "thread_id_gmail",
  "gmail_id",
  "subject",
  "canal_origen",
  "prioridad",
  "fecha_ingesta",
  "estado_ingesta"
];

function jsonResponse(payload, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(TARGET_SHEET_NAME);

  if (!sheet) {
    throw new Error("No existe la hoja " + TARGET_SHEET_NAME);
  }

  return sheet;
}

function ensureHeaders_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const current = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const headers = current.filter(function (value) {
    return String(value || "").trim() !== "";
  });
  const missing = REQUIRED_HEADERS.filter(function (header) {
    return headers.indexOf(header) === -1;
  });

  if (headers.length === 0) {
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);
    return REQUIRED_HEADERS;
  }

  if (missing.length > 0) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
  }

  return headers.concat(missing);
}

function getExistingMessageIds_(sheet, headers) {
  const index = headers.indexOf("message_id_gmail");

  if (index === -1 || sheet.getLastRow() < 2) {
    return {};
  }

  const values = sheet.getRange(2, index + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.reduce(function (acc, row) {
    const value = String(row[0] || "").trim();

    if (value) {
      acc[value] = true;
    }

    return acc;
  }, {});
}

function buildRow_(headers, source, ticketId) {
  const now = new Date().toISOString();
  const values = {
    ticket_id: ticketId,
    fecha_creacion: source.fecha_recepcion || now.substring(0, 10),
    fecha_modificacion: source.fecha_modificacion || now,
    fecha_solicitud: source.fecha_solicitud || source.fecha_recepcion || "",
    hora_inicio: source.hora_inicio || "",
    hora_termino: source.hora_termino || "",
    cli_rut: source.cli_rut || "",
    cli_nombre: source.cli_nombre || "",
    contacto_cliente: source.contacto_cliente || "",
    email_contacto: source.email_contacto || "",
    telefono_contacto: source.telefono_contacto || "",
    ubicacion_id: source.ubicacion_id || "",
    mod_id: source.mod_id || "",
    tipo_ticket_id: source.tipo_ticket_id || "",
    usr_responsable_id: source.usr_responsable_id || "",
    estado_ticket: source.estado_ticket || "Abierto",
    observacion: source.observacion || "",
    message_id_gmail: source.message_id_gmail || "",
    thread_id_gmail: source.thread_id_gmail || "",
    gmail_id: source.gmail_id || "",
    subject: source.subject || "",
    canal_origen: source.canal_origen || "Email",
    prioridad: source.prioridad || "Media",
    fecha_ingesta: source.fecha_ingesta || now,
    estado_ingesta: source.estado_ingesta || "PENDIENTE_REVISION"
  };

  return headers.map(function (header) {
    return values[header] || "";
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const expectedToken = PropertiesService.getScriptProperties().getProperty(TOKEN_PROPERTY_NAME);

    if (!expectedToken || body.token !== expectedToken) {
      return jsonResponse({
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Token invalido"
        }
      });
    }

    const rows = Array.isArray(body.rows) ? body.rows : [];
    const sheet = getSheet_();
    const headers = ensureHeaders_(sheet);
    const existing = getExistingMessageIds_(sheet, headers);
    const newRows = [];
    let duplicates = 0;
    let skipped = 0;

    rows.forEach(function (row) {
      const messageId = String(row.message_id_gmail || "").trim();

      if (!messageId) {
        skipped += 1;
        return;
      }

      if (existing[messageId]) {
        duplicates += 1;
        return;
      }

      existing[messageId] = true;
      newRows.push(buildRow_(headers, row, sheet.getLastRow() + newRows.length));
    });

    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
    }

    return jsonResponse({
      ok: true,
      data: {
        appended: newRows.length,
        duplicates: duplicates,
        received: rows.length,
        skipped: skipped
      }
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: {
        code: "APPS_SCRIPT_ERROR",
        message: error && error.message ? error.message : "Error inesperado"
      }
    });
  }
}
