param(
  [string]$EnvPath = "C:\RODPROJECTSCODEX\workspace\c2c-soporte\backend\.env",
  [string]$WebAppUrl,
  [string]$Token,
  [string]$RequestedBy = "soporte-emergencia",
  [string]$Subject = "Ticket soporte emergencia",
  [string]$FromEmail = "soporte@example.com",
  [string]$FromName = "Soporte emergencia",
  [string]$CompanyName = "",
  [string]$Rut = "",
  [string]$Observation = "Registro manual de emergencia enviado a INFO_TICKETS_SOPORTE.",
  [string]$Priority = "Media",
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-DotEnv {
  param([string]$Path)

  $values = @{}

  if (-not (Test-Path -LiteralPath $Path)) {
    return $values
  }

  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()

    if ($line.Length -eq 0 -or $line.StartsWith("#") -or -not $line.Contains("=")) {
      return
    }

    $parts = $line.Split("=", 2)
    $key = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")

    if ($key) {
      $values[$key] = $value
    }
  }

  return $values
}

$envValues = Read-DotEnv -Path $EnvPath

if (-not $WebAppUrl -and $envValues.ContainsKey("GOOGLE_SHEETS_HELPDESK_WEBAPP_URL")) {
  $WebAppUrl = $envValues["GOOGLE_SHEETS_HELPDESK_WEBAPP_URL"]
}

if (-not $Token -and $envValues.ContainsKey("GOOGLE_SHEETS_HELPDESK_TOKEN")) {
  $Token = $envValues["GOOGLE_SHEETS_HELPDESK_TOKEN"]
}

if (-not $WebAppUrl) {
  throw "Falta WebAppUrl. Configura GOOGLE_SHEETS_HELPDESK_WEBAPP_URL en backend\.env o usa -WebAppUrl."
}

if (-not $Token) {
  throw "Falta Token. Configura GOOGLE_SHEETS_HELPDESK_TOKEN en backend\.env o usa -Token."
}

$now = Get-Date
$nowIso = $now.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$messageId = "manual-emergency-$($now.ToString('yyyyMMddHHmmss'))-$([guid]::NewGuid().ToString('N').Substring(0, 8))@c2c-soporte.local"

$row = [ordered]@{
  fecha_recepcion = $now.ToString("yyyy-MM-dd")
  fecha_modificacion = $nowIso
  fecha_solicitud = $now.ToString("yyyy-MM-dd")
  hora_inicio = $now.ToString("HH:mm:ss")
  hora_termino = ""
  cli_rut = $Rut
  cli_nombre = $CompanyName
  contacto_cliente = $FromName
  email_contacto = $FromEmail
  telefono_contacto = ""
  ubicacion_id = ""
  mod_id = ""
  tipo_ticket_id = ""
  usr_responsable_id = ""
  estado_ticket = "Abierto"
  observacion = $Observation
  message_id_gmail = $messageId
  thread_id_gmail = "manual-emergency"
  gmail_id = "manual-emergency"
  subject = $Subject
  canal_origen = "Email"
  prioridad = $Priority
  fecha_ingesta = $nowIso
  estado_ingesta = "PENDIENTE_REVISION"
}

$payload = [ordered]@{
  requestedBy = $RequestedBy
  rows = @($row)
  targetSheet = "INFO_TICKETS_SOPORTE"
  token = $Token
}

$json = $payload | ConvertTo-Json -Depth 8

if ($DryRun) {
  $safePayload = [ordered]@{
    requestedBy = $RequestedBy
    rows = @($row)
    targetSheet = "INFO_TICKETS_SOPORTE"
    token = "***"
  }

  $safePayload | ConvertTo-Json -Depth 8
  exit 0
}

$response = Invoke-RestMethod -Uri $WebAppUrl -Method Post -ContentType "application/json" -Body $json
$response | ConvertTo-Json -Depth 8
