$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$deploy = Join-Path $workspace "deploy-web"

if (-not $deploy.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Deploy path is outside the workspace: $deploy"
}

if (Test-Path -LiteralPath $deploy) {
  Remove-Item -LiteralPath $deploy -Recurse -Force
}
New-Item -ItemType Directory -Path $deploy | Out-Null

$files = @(
  "index.html",
  "login.html",
  "teacher.html",
  "select.html",
  "confirm.html",
  "waiting.html",
  "exam.html",
  "exam-math.html",
  "exam-reading.html",
  "exam-science.html",
  "ai-studio.html",
  "script.js",
  "style.css",
  "_headers"
)

foreach ($relativePath in $files) {
  $source = Join-Path $workspace $relativePath
  if (-not (Test-Path -LiteralPath $source)) {
    throw "Missing deploy source: $relativePath"
  }
  Copy-Item -LiteralPath $source -Destination (Join-Path $deploy $relativePath) -Force
}

foreach ($folder in @("css", "js")) {
  Copy-Item -LiteralPath (Join-Path $workspace $folder) -Destination (Join-Path $deploy $folder) -Recurse -Force
}

$embeddedExamFallback = Join-Path $deploy "js\tsa001-fallback.js"
if (Test-Path -LiteralPath $embeddedExamFallback) {
  Remove-Item -LiteralPath $embeddedExamFallback -Force
}

$forbidden = @("assets", "data", "supabase", "cloudflare", "scratch")
foreach ($folder in $forbidden) {
  if (Test-Path -LiteralPath (Join-Path $deploy $folder)) {
    throw "Heavy or private folder leaked into deploy package: $folder"
  }
}

$size = (Get-ChildItem -LiteralPath $deploy -Recurse -File | Measure-Object Length -Sum).Sum
Write-Host ("Netlify package ready: {0:N2} MB" -f ($size / 1MB))
Write-Host "Large assets and exam JSON remain on Cloudflare R2."
