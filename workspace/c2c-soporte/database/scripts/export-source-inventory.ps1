param(
  [Parameter(Mandatory = $true)]
  [string] $HostName,

  [Parameter(Mandatory = $true)]
  [int] $Port,

  [Parameter(Mandatory = $true)]
  [string] $Database,

  [Parameter(Mandatory = $true)]
  [string] $User,

  [string] $OutputDir = ".\database\inventory\source"
)

$ErrorActionPreference = "Stop"

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  throw "psql no esta disponible en PATH. Abre una terminal con PostgreSQL configurado o usa la ruta completa de psql."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$targetDir = Join-Path $OutputDir $timestamp
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$queries = @(
  @{ Name = "20-public-table-inventory"; File = ".\database\sql\source-readonly\20-public-table-inventory.sql" },
  @{ Name = "21-public-columns-inventory"; File = ".\database\sql\source-readonly\21-public-columns-inventory.sql" },
  @{ Name = "22-public-indexes-inventory"; File = ".\database\sql\source-readonly\22-public-indexes-inventory.sql" },
  @{ Name = "23-public-table-estimates"; File = ".\database\sql\source-readonly\23-public-table-estimates.sql" },
  @{ Name = "24-documentos-date-candidates"; File = ".\database\sql\source-readonly\24-documentos-date-candidates.sql" }
)

foreach ($query in $queries) {
  $outputPath = Join-Path $targetDir "$($query.Name).csv"

  & $psql.Source `
    -h $HostName `
    -p $Port `
    -U $User `
    -d $Database `
    -v ON_ERROR_STOP=1 `
    -f $query.File `
    --csv `
    -o $outputPath
}

Write-Host "Inventario exportado en: $targetDir"

