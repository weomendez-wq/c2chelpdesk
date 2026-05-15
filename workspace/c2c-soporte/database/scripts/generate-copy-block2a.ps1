param(
  [string] $OutputRoot = ".\database\generated\copy-block2a"
)

$ErrorActionPreference = "Stop"

function Quote-SqlIdentifier {
  param([Parameter(Mandatory = $true)][string] $Name)
  return '"' + $Name.Replace('"', '""') + '"'
}

$relations = @(
  [pscustomobject]@{
    Name = "sincronizacionsap"
    Source = "public.sincronizacionsap"
    EstimatedRows = 192903
    Columns = @(
      [pscustomobject]@{ Name = "rut"; Type = "integer" },
      [pscustomobject]@{ Name = "folio"; Type = "integer" },
      [pscustomobject]@{ Name = "sapdocnum"; Type = "integer" },
      [pscustomobject]@{ Name = "tipodocumento"; Type = "integer" },
      [pscustomobject]@{ Name = "fechaenvio"; Type = "character varying(255)" },
      [pscustomobject]@{ Name = "estado"; Type = "character varying(255)" },
      [pscustomobject]@{ Name = "ticket"; Type = "character varying(25)" },
      [pscustomobject]@{ Name = "efectivo"; Type = "integer" },
      [pscustomobject]@{ Name = "tarjeta"; Type = "integer" },
      [pscustomobject]@{ Name = "detalletarjeta"; Type = "character varying(255)" },
      [pscustomobject]@{ Name = "tipotarjeta"; Type = "character varying(20)" },
      [pscustomobject]@{ Name = "monto"; Type = "integer" },
      [pscustomobject]@{ Name = "error"; Type = "character varying(255)" },
      [pscustomobject]@{ Name = "vouchernum"; Type = "character varying(255)" },
      [pscustomobject]@{ Name = "fechaemision"; Type = "character varying(255)" }
    )
  },
  [pscustomobject]@{
    Name = "mv_device_operacion"
    Source = "public.mv_device_operacion"
    EstimatedRows = 384
    Columns = @(
      [pscustomobject]@{ Name = "tenant_id"; Type = "uuid" },
      [pscustomobject]@{ Name = "device_id"; Type = "character varying(255)" },
      [pscustomobject]@{ Name = "created_at"; Type = "timestamp without time zone" },
      [pscustomobject]@{ Name = "fecha_primer_doc"; Type = "date" },
      [pscustomobject]@{ Name = "fecha_ultimo_doc"; Type = "date" }
    )
  }
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $OutputRoot $timestamp
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$createSql = New-Object System.Collections.Generic.List[string]
$verifySql = New-Object System.Collections.Generic.List[string]
$sourceCountSql = New-Object System.Collections.Generic.List[string]
$localCountSql = New-Object System.Collections.Generic.List[string]

$createSql.Add("-- Generado localmente. Revisar antes de ejecutar.")
$createSql.Add("-- Crea tablas del bloque 2A en staging_public sin copiar datos.")
$createSql.Add("CREATE SCHEMA IF NOT EXISTS staging_public;")
$createSql.Add("")

foreach ($relation in $relations) {
  $columnDefinitions = foreach ($column in $relation.Columns) {
    "  $(Quote-SqlIdentifier $column.Name) $($column.Type)"
  }
  $columnList = ($relation.Columns | ForEach-Object { Quote-SqlIdentifier $_.Name }) -join ", "

  $createSql.Add("CREATE TABLE IF NOT EXISTS staging_public.$(Quote-SqlIdentifier $relation.Name) (")
  $createSql.Add(($columnDefinitions -join ",`n"))
  $createSql.Add(");")
  $createSql.Add("")

  $verifySql.Add("SELECT '$($relation.Name)' AS table_name, count(*) AS local_rows FROM staging_public.$(Quote-SqlIdentifier $relation.Name)")
  $sourceCountSql.Add("SELECT '$($relation.Name)' AS table_name, count(*)::bigint AS rows_count FROM $($relation.Source)")
  $localCountSql.Add("SELECT '$($relation.Name)' AS table_name, count(*)::bigint AS rows_count FROM staging_public.$(Quote-SqlIdentifier $relation.Name)")
}

Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "01-create-staging-tables.sql") -Value ($createSql -join "`n")
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "04-verify-staging-counts.sql") -Value (($verifySql -join "`nUNION ALL`n") + "`nORDER BY table_name;`n")
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "05-source-counts.sql") -Value (($sourceCountSql -join "`nUNION ALL`n") + "`nORDER BY table_name;`n")
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "06-local-counts.sql") -Value (($localCountSql -join "`nUNION ALL`n") + "`nORDER BY table_name;`n")

$relations |
  Select-Object Name, Source, EstimatedRows, @{Name = "Columns"; Expression = { $_.Columns.Count }} |
  Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $outputDir "relations-manifest.csv")

$exportScript = @'
param(
  [Parameter(Mandatory = $true)][string] $HostName,
  [Parameter(Mandatory = $true)][int] $Port,
  [Parameter(Mandatory = $true)][string] $Database,
  [Parameter(Mandatory = $true)][string] $User,
  [Parameter(Mandatory = $true)][string] $DataDir
)

$ErrorActionPreference = "Stop"
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) { throw "psql no esta disponible en PATH." }

New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
$previousPgOptions = $env:PGOPTIONS
$env:PGOPTIONS = "-c default_transaction_read_only=on -c statement_timeout=30000 -c lock_timeout=5000"

try {
'@

$importScript = @'
param(
  [Parameter(Mandatory = $true)][string] $HostName,
  [Parameter(Mandatory = $true)][int] $Port,
  [Parameter(Mandatory = $true)][string] $Database,
  [Parameter(Mandatory = $true)][string] $User,
  [Parameter(Mandatory = $true)][string] $DataDir
)

$ErrorActionPreference = "Stop"
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) { throw "psql no esta disponible en PATH." }

'@

foreach ($relation in $relations) {
  $columnList = ($relation.Columns | ForEach-Object { Quote-SqlIdentifier $_.Name }) -join ", "
  $exportQuery = "\copy (SELECT $columnList FROM $($relation.Source)) TO '__CSV_PATH__' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
  $importQuery = "\copy staging_public.$(Quote-SqlIdentifier $relation.Name) ($columnList) FROM '__CSV_PATH__' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"

  $exportScript += @"

  Write-Host "Exportando $($relation.Name)..."
  `$csvPath = Join-Path `$DataDir "$($relation.Name).csv"
  `$sqlPath = Join-Path `$DataDir "_export_$($relation.Name).sql"
  `$copySql = @'
$exportQuery
'@
  `$copySql = `$copySql.Replace("__CSV_PATH__", `$csvPath.Replace("'", "''"))
  Set-Content -Encoding UTF8 -Path `$sqlPath -Value `$copySql
  & `$psql.Source -h `$HostName -p `$Port -U `$User -d `$Database -v ON_ERROR_STOP=1 -f `$sqlPath
"@

  $importScript += @"

Write-Host "Importando $($relation.Name)..."
`$csvPath = Join-Path `$DataDir "$($relation.Name).csv"
`$sqlPath = Join-Path `$DataDir "_import_$($relation.Name).sql"
`$copySql = @'
TRUNCATE TABLE staging_public.$(Quote-SqlIdentifier $relation.Name);
$importQuery
'@
`$copySql = `$copySql.Replace("__CSV_PATH__", `$csvPath.Replace("'", "''"))
Set-Content -Encoding UTF8 -Path `$sqlPath -Value `$copySql
& `$psql.Source -h `$HostName -p `$Port -U `$User -d `$Database -v ON_ERROR_STOP=1 -f `$sqlPath
"@
}

$exportScript += @'

}
finally {
  $env:PGOPTIONS = $previousPgOptions
}
'@

Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "02-export-source-csv.ps1") -Value $exportScript
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "03-import-local-csv.ps1") -Value $importScript

Write-Host "Bloque 2A generado en: $outputDir"
