param(
  [Parameter(Mandatory = $true)]
  [string] $InventoryDir,

  [int] $SmallTableMaxRows = 100000,

  [string[]] $AlwaysLimitedTables = @(
    "documentos",
    "enviosiidocs",
    "cierrecaja_documento",
    "documentos_fecha_normalizada",
    "contabilizaciondocs"
  )
)

$ErrorActionPreference = "Stop"

$estimatesPath = Join-Path $InventoryDir "23-public-table-estimates.csv"
if (-not (Test-Path $estimatesPath)) {
  throw "No existe el archivo requerido: $estimatesPath"
}

$outputDir = Join-Path $InventoryDir "copy-candidates"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$estimates = Import-Csv -LiteralPath $estimatesPath

$classified = foreach ($row in $estimates) {
  $estimatedRows = [int64]$row.estimated_rows
  $tableName = [string]$row.table_name
  $relationKind = [string]$row.relation_kind

  $category = if ($AlwaysLimitedTables -contains $tableName) {
    "limited_or_special"
  }
  elseif ($relationKind -ne "r") {
    "review_relation_kind"
  }
  elseif ($estimatedRows -ge 0 -and $estimatedRows -le $SmallTableMaxRows) {
    "copy_full_candidate"
  }
  elseif ($estimatedRows -lt 0) {
    "unknown_estimate_review"
  }
  else {
    "large_table_review"
  }

  [pscustomobject]@{
    table_name = $tableName
    relation_kind = $relationKind
    estimated_rows = $estimatedRows
    total_size = $row.total_size
    category = $category
  }
}

$classified |
  Sort-Object category, @{ Expression = "estimated_rows"; Descending = $true }, table_name |
  Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $outputDir "copy-candidates.csv")

$classified |
  Where-Object { $_.category -eq "copy_full_candidate" } |
  Sort-Object table_name |
  Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $outputDir "copy-full-candidates.csv")

$classified |
  Where-Object { $_.category -ne "copy_full_candidate" } |
  Sort-Object category, @{ Expression = "estimated_rows"; Descending = $true }, table_name |
  Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $outputDir "copy-review-required.csv")

Write-Host "Candidatos generados en: $outputDir"

