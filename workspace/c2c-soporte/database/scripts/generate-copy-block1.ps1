param(
  [Parameter(Mandatory = $true)]
  [string] $InventoryDir,

  [string] $OutputRoot = ".\database\generated\copy-block1"
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

$candidatesPath = Join-Path $InventoryDir "copy-candidates\copy-full-candidates.csv"
$columnsPath = Join-Path $InventoryDir "21-public-columns-inventory.csv"

if (-not (Test-Path $candidatesPath)) {
  throw "No existe el archivo requerido: $candidatesPath"
}

if (-not (Test-Path $columnsPath)) {
  throw "No existe el archivo requerido: $columnsPath"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $OutputRoot $timestamp
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$candidates = Import-Csv -LiteralPath $candidatesPath | Sort-Object table_name
$candidateNames = $candidates | Select-Object -ExpandProperty table_name
$columns = Import-Csv -LiteralPath $columnsPath |
  Where-Object { $candidateNames -contains $_.table_name } |
  Sort-Object table_name, {[int]$_.ordinal_position}

$createSql = New-Object System.Collections.Generic.List[string]
$verifySql = New-Object System.Collections.Generic.List[string]
$tableManifest = New-Object System.Collections.Generic.List[object]

$createSql.Add("-- Generado localmente. Revisar antes de ejecutar.")
$createSql.Add("-- Crea tablas del bloque 1 en staging_public sin copiar datos.")
$createSql.Add("CREATE SCHEMA IF NOT EXISTS staging_public;")
$createSql.Add("")

foreach ($candidate in $candidates) {
  $tableName = $candidate.table_name
  $tableColumns = @($columns | Where-Object { $_.table_name -eq $tableName })

  if ($tableColumns.Count -eq 0) {
    throw "No hay columnas inventariadas para tabla: $tableName"
  }

  $columnDefinitions = foreach ($column in $tableColumns) {
    $nullable = if ($column.is_nullable -eq "NO") { " NOT NULL" } else { "" }
    "  $(Quote-SqlIdentifier $column.column_name) $(Get-ColumnType $column)$nullable"
  }

  $createSql.Add("CREATE TABLE IF NOT EXISTS staging_public.$(Quote-SqlIdentifier $tableName) (")
  $createSql.Add(($columnDefinitions -join ",`n"))
  $createSql.Add(");")
  $createSql.Add("")

  $verifySql.Add("SELECT '$tableName' AS table_name, count(*) AS local_rows FROM staging_public.$(Quote-SqlIdentifier $tableName)")

  $tableManifest.Add([pscustomobject]@{
    table_name = $tableName
    estimated_rows = $candidate.estimated_rows
    total_size = $candidate.total_size
    columns = $tableColumns.Count
  })
}

Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "01-create-staging-tables.sql") -Value ($createSql -join "`n")
Set-Content -Encoding UTF8 -Path (Join-Path $outputDir "04-verify-staging-counts.sql") -Value (($verifySql -join "`nUNION ALL`n") + "`nORDER BY table_name;`n")
$tableManifest | Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $outputDir "tables-manifest.csv")

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

foreach ($candidate in $candidates) {
  $tableName = $candidate.table_name
  $tableColumns = @($columns | Where-Object { $_.table_name -eq $tableName })
  $columnList = ($tableColumns | ForEach-Object { Quote-SqlIdentifier $_.column_name }) -join ", "
  $exportQuery = "\copy (SELECT $columnList FROM public.$(Quote-SqlIdentifier $tableName)) TO '__CSV_PATH__' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
  $importQuery = "\copy staging_public.$(Quote-SqlIdentifier $tableName) ($columnList) FROM '__CSV_PATH__' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"

  $exportScript += @"

  Write-Host "Exportando $tableName..."
  `$csvPath = Join-Path `$DataDir "$tableName.csv"
  `$sqlPath = Join-Path `$DataDir "_export_$tableName.sql"
  `$copySql = @'
$exportQuery
'@
  `$copySql = `$copySql.Replace("__CSV_PATH__", `$csvPath.Replace("'", "''"))
  Set-Content -Encoding UTF8 -Path `$sqlPath -Value `$copySql
  & `$psql.Source -h `$HostName -p `$Port -U `$User -d `$Database -v ON_ERROR_STOP=1 -f `$sqlPath
"@

  $importScript += @"

Write-Host "Importando $tableName..."
`$csvPath = Join-Path `$DataDir "$tableName.csv"
`$sqlPath = Join-Path `$DataDir "_import_$tableName.sql"
`$copySql = @'
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

Write-Host "Bloque 1 generado en: $outputDir"
