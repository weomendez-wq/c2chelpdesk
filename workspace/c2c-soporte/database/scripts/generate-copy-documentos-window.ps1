param(
  [Parameter(Mandatory = $true)]
  [string] $InventoryDir,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')]
  [string] $StartDate,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')]
  [string] $EndDate,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9_]+$')]
  [string] $TargetTable,

  [string] $OutputRoot = ".\database\generated\copy-documentos-window"
)

$ErrorActionPreference = "Stop"

function Quote-SqlIdentifier {
  param([Parameter(Mandatory = $true)][string] $Name)
  return '"' + $Name.Replace('"', '""') + '"'
}

function Get-ColumnType {
  param([Parameter(Mandatory = $true)] $Column)

  switch ($Column.data_type) {
    "character varying" {
      if ($Column.character_maximum_length) {
        return "character varying($($Column.character_maximum_length))"
      }
      return "character varying"
    }
    "numeric" {
      if ($Column.numeric_precision -and $Column.numeric_scale) {
        return "numeric($($Column.numeric_precision),$($Column.numeric_scale))"
      }
      if ($Column.numeric_precision) {
        return "numeric($($Column.numeric_precision))"
      }
      return "numeric"
    }
    default {
      return $Column.data_type
    }
  }
}

$columnsPath = Join-Path $InventoryDir "21-public-columns-inventory.csv"
if (-not (Test-Path $columnsPath)) {
  throw "No existe el archivo requerido: $columnsPath"
}

$sourceTable = "documentos"
$whereClause = "rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) >= timestamp '$StartDate' AND rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) < timestamp '$EndDate'"

$columns = Import-Csv -LiteralPath $columnsPath |
  Where-Object { $_.table_name -eq $sourceTable } |
  Sort-Object {[int]$_.ordinal_position}

if (@($columns).Count -eq 0) {
  throw "No hay columnas inventariadas para tabla: $sourceTable"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $OutputRoot "$TargetTable-$timestamp"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$columnDefinitions = foreach ($column in $columns) {
  $nullable = if ($column.is_nullable -eq "NO") { " NOT NULL" } else { "" }
  "  $(Quote-SqlIdentifier $column.column_name) $(Get-ColumnType $column)$nullable"
}

$columnList = ($columns | ForEach-Object { Quote-SqlIdentifier $_.column_name }) -join ", "

$createSql = @"
-- Generado localmente. Revisar antes de ejecutar.
-- Crea tabla de ventana para documentos en staging_public.
CREATE SCHEMA IF NOT EXISTS staging_public;

CREATE TABLE IF NOT EXISTS staging_public.$(Quote-SqlIdentifier $TargetTable) (
$($columnDefinitions -join ",`n")
);
"@

$verifySql = @"
SELECT '$TargetTable' AS table_name, count(*) AS local_rows
FROM staging_public.$(Quote-SqlIdentifier $TargetTable);
"@

$sourceCountSql = @"
SELECT '$TargetTable' AS table_name, count(*)::bigint AS rows_count
FROM public.$(Quote-SqlIdentifier $sourceTable)
WHERE $whereClause;
"@

$localCountSql = @"
SELECT '$TargetTable' AS table_name, count(*)::bigint AS rows_count
FROM staging_public.$(Quote-SqlIdentifier $TargetTable);
"@

Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "01-create-staging-tables.sql") -Value $createSql
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "04-verify-staging-counts.sql") -Value $verifySql
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "05-source-counts.sql") -Value $sourceCountSql
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "06-local-counts.sql") -Value $localCountSql

[pscustomobject]@{
  source_table = $sourceTable
  target_table = $TargetTable
  start_date = $StartDate
  end_date = $EndDate
  filter = $whereClause
  columns = @($columns).Count
} | Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $outputDir "relations-manifest.csv")

$exportQuery = "\copy (SELECT $columnList FROM public.$(Quote-SqlIdentifier $sourceTable) WHERE $whereClause) TO '__CSV_PATH__' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
$importQuery = "\copy staging_public.$(Quote-SqlIdentifier $TargetTable) ($columnList) FROM '__CSV_PATH__' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"

$exportScript = @"
param(
  [Parameter(Mandatory = `$true)][string] `$HostName,
  [Parameter(Mandatory = `$true)][int] `$Port,
  [Parameter(Mandatory = `$true)][string] `$Database,
  [Parameter(Mandatory = `$true)][string] `$User,
  [Parameter(Mandatory = `$true)][string] `$DataDir
)

`$ErrorActionPreference = "Stop"
`$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not `$psql) { throw "psql no esta disponible en PATH." }

New-Item -ItemType Directory -Force -Path `$DataDir | Out-Null
`$previousPgOptions = `$env:PGOPTIONS
`$env:PGOPTIONS = "-c default_transaction_read_only=on -c statement_timeout=30000 -c lock_timeout=5000"

try {
  Write-Host "Exportando $TargetTable..."
  `$csvPath = Join-Path `$DataDir "$TargetTable.csv"
  `$sqlPath = Join-Path `$DataDir "_export_$TargetTable.sql"
  `$copySql = @'
$exportQuery
'@
  `$copySql = `$copySql.Replace("__CSV_PATH__", `$csvPath.Replace("'", "''"))
  Set-Content -Encoding UTF8 -Path `$sqlPath -Value `$copySql
  & `$psql.Source -h `$HostName -p `$Port -U `$User -d `$Database -v ON_ERROR_STOP=1 -f `$sqlPath
}
finally {
  `$env:PGOPTIONS = `$previousPgOptions
}
"@

$importScript = @"
param(
  [Parameter(Mandatory = `$true)][string] `$HostName,
  [Parameter(Mandatory = `$true)][int] `$Port,
  [Parameter(Mandatory = `$true)][string] `$Database,
  [Parameter(Mandatory = `$true)][string] `$User,
  [Parameter(Mandatory = `$true)][string] `$DataDir
)

`$ErrorActionPreference = "Stop"
`$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not `$psql) { throw "psql no esta disponible en PATH." }

Write-Host "Importando $TargetTable..."
`$csvPath = Join-Path `$DataDir "$TargetTable.csv"
`$sqlPath = Join-Path `$DataDir "_import_$TargetTable.sql"
`$copySql = @'
TRUNCATE TABLE staging_public.$(Quote-SqlIdentifier $TargetTable);
$importQuery
'@
`$copySql = `$copySql.Replace("__CSV_PATH__", `$csvPath.Replace("'", "''"))
Set-Content -Encoding UTF8 -Path `$sqlPath -Value `$copySql
& `$psql.Source -h `$HostName -p `$Port -U `$User -d `$Database -v ON_ERROR_STOP=1 -f `$sqlPath
"@

Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "02-export-source-csv.ps1") -Value $exportScript
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "03-import-local-csv.ps1") -Value $importScript

Write-Host "Ventana documentos generada en: $outputDir"
