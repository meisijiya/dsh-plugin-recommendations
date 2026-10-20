<#
.SYNOPSIS
  DSH plugin recommendation repo - one-click installer (PowerShell shell).

.DESCRIPTION
  The real logic lives in scripts\install.mjs (single cross-platform source).
  This file only locates it and forwards arguments.

  Every install command is replayed verbatim from the upstream repository's
  own README / source, never re-authored here.

  NOTE: this file is intentionally ASCII-only and saved with a UTF-8 BOM so
  that Windows PowerShell 5.1 parses it correctly (it decides encoding by
  BOM, not by the absence of non-ASCII bytes).

.EXAMPLE
  .\install.ps1 --list
  .\install.ps1 --dry-run --category market,dev
  .\install.ps1 --install --preset shell
  .\install.ps1 --install --profile dsh-tui --only dshmarket
#>
[CmdletBinding()]
param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$InstallArgs
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$core = Join-Path $scriptDir 'scripts\install.mjs'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host '[error] node is required to run the installer (DSH ships with node).' -ForegroundColor Red
  exit 1
}

& node $core @InstallArgs
exit $LASTEXITCODE
