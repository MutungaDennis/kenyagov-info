# fix-admin-route-groups.ps1
# Run from the project root: D:\kenyagov-info
# IMPORTANT: stop `pnpm dev` before running this script.

$ErrorActionPreference = "Stop"

$admin = Join-Path $PWD "app\admin"
$auth = Join-Path $admin "(auth)"
$protected = Join-Path $admin "(protected)"

if (-not (Test-Path $admin)) {
  throw "app\admin was not found. Run this script from the project root."
}

New-Item -ItemType Directory -Force -Path $auth | Out-Null
New-Item -ItemType Directory -Force -Path $protected | Out-Null

function Move-DirectorySafely {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
  )

  if (-not (Test-Path $Source)) {
    return
  }

  if (Test-Path $Destination) {
    # Merge files/directories without nesting Source inside Destination.
    Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
      $target = Join-Path $Destination $_.Name

      if ($_.PSIsContainer) {
        Move-DirectorySafely -Source $_.FullName -Destination $target
      } else {
        if (Test-Path $target) {
          throw "Collision: '$target' already exists. Resolve it manually before continuing."
        }
        Move-Item -LiteralPath $_.FullName -Destination $target
      }
    }

    # Remove now-empty source.
    if ((Get-ChildItem -LiteralPath $Source -Force | Measure-Object).Count -eq 0) {
      Remove-Item -LiteralPath $Source -Force
    }
  } else {
    Move-Item -LiteralPath $Source -Destination $Destination
  }
}

Write-Host "1. Consolidating authentication routes..." -ForegroundColor Cyan

$authNames = @("login", "forgot-password", "reset-password")

foreach ($name in $authNames) {
  $old = Join-Path $admin $name
  $new = Join-Path $auth $name

  if (Test-Path $old) {
    if (Test-Path $new) {
      # If both exist, remove duplicate old files only when the same relative file
      # already exists in the new location. Abort on anything unique so nothing is lost.
      $unique = @()

      Get-ChildItem -LiteralPath $old -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($old.Length).TrimStart('\')
        $counterpart = Join-Path $new $rel
        if (-not (Test-Path $counterpart)) {
          $unique += $_.FullName
        }
      }

      if ($unique.Count -gt 0) {
        Write-Host ""
        Write-Host "The old '$name' folder contains files not present under (auth):" -ForegroundColor Yellow
        $unique | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        throw "Migration stopped to avoid deleting unique auth files."
      }

      Remove-Item -LiteralPath $old -Recurse -Force
      Write-Host "Removed duplicate old route: app/admin/$name"
    } else {
      Move-Item -LiteralPath $old -Destination $new
      Write-Host "Moved app/admin/$name -> app/admin/(auth)/$name"
    }
  }
}

Write-Host ""
Write-Host "2. Moving every remaining admin route under (protected)..." -ForegroundColor Cyan

# These are shared infrastructure, not routes to move.
$excludedNames = @(
  "(auth)",
  "(protected)",
  "layout.tsx",
  "AdminNav.tsx",
  "admin.css"
)

Get-ChildItem -LiteralPath $admin -Force | ForEach-Object {
  if ($excludedNames -contains $_.Name) {
    return
  }

  if ($_.PSIsContainer) {
    $destination = Join-Path $protected $_.Name
    Move-DirectorySafely -Source $_.FullName -Destination $destination
    Write-Host "Protected route moved: $($_.Name)"
    return
  }

  # The root dashboard page must be protected too.
  if ($_.Name -eq "page.tsx") {
    $destination = Join-Path $protected "page.tsx"
    if (Test-Path $destination) {
      throw "Collision: app/admin/(protected)/page.tsx already exists."
    }
    Move-Item -LiteralPath $_.FullName -Destination $destination
    Write-Host "Protected dashboard moved: app/admin/page.tsx"
    return
  }

  # Leave other shared top-level files alone, but report them.
  Write-Host "Left shared/unclassified file in app/admin: $($_.Name)" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "3. Clearing generated Next.js cache..." -ForegroundColor Cyan

$nextDir = Join-Path $PWD ".next"
if (Test-Path $nextDir) {
  Remove-Item -LiteralPath $nextDir -Recurse -Force
  Write-Host "Removed .next"
}

Write-Host ""
Write-Host "4. Result check..." -ForegroundColor Cyan

$oldAuthLeft = @()
foreach ($name in $authNames) {
  $p = Join-Path $admin $name
  if (Test-Path $p) { $oldAuthLeft += $p }
}

if ($oldAuthLeft.Count -gt 0) {
  Write-Host "Old auth routes still exist:" -ForegroundColor Red
  $oldAuthLeft | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw "Old auth route cleanup incomplete."
}

$rootPage = Join-Path $admin "page.tsx"
if (Test-Path $rootPage) {
  throw "app/admin/page.tsx still exists; it must be app/admin/(protected)/page.tsx."
}

Write-Host ""
Write-Host "Admin route-group migration is structurally complete." -ForegroundColor Green
Write-Host ""
Write-Host "Expected structure:"
Write-Host "  app/admin/layout.tsx"
Write-Host "  app/admin/(auth)/layout.tsx"
Write-Host "  app/admin/(auth)/login/page.tsx"
Write-Host "  app/admin/(protected)/layout.tsx"
Write-Host "  app/admin/(protected)/page.tsx"
Write-Host "  app/admin/(protected)/legislation/..."
Write-Host "  app/admin/(protected)/constitution/..."
Write-Host "  app/admin/(protected)/gazette/..."
Write-Host ""
Write-Host "Now run: pnpm dev" -ForegroundColor Green