# Run from the project root.
# Review the list before running if you have custom admin folders.

$ErrorActionPreference = "Stop"

$admin = Join-Path $PWD "app\admin"
$authGroup = Join-Path $admin "(auth)"
$protectedGroup = Join-Path $admin "(protected)"

New-Item -ItemType Directory -Force -Path $authGroup | Out-Null
New-Item -ItemType Directory -Force -Path $protectedGroup | Out-Null

# Authentication screens: URL remains /admin/<name>
$authRoutes = @(
  "login",
  "forgot-password",
  "reset-password"
)

foreach ($name in $authRoutes) {
  $source = Join-Path $admin $name
  $destination = Join-Path $authGroup $name

  if (Test-Path $source) {
    if (Test-Path $destination) {
      Write-Warning "Skipping $source because $destination already exists."
    } else {
      Move-Item $source $destination
      Write-Host "Moved auth route: $name"
    }
  }
}

# Protected route folders known in CitizenGuide.
# Add any other admin route directories you have before running.
$protectedRoutes = @(
  "institutions",
  "officials",
  "mcas",
  "hansard",
  "constitution",
  "legislation",
  "kenya-gazette",
  "gazette",
  "polling-stations",
  "contact",
  "feedback",
  "bug-reports",
  "analytics",
  "site-status"
)

foreach ($name in $protectedRoutes) {
  $source = Join-Path $admin $name
  $destination = Join-Path $protectedGroup $name

  if (Test-Path $source) {
    if (Test-Path $destination) {
      Write-Warning "Skipping $source because $destination already exists."
    } else {
      Move-Item $source $destination
      Write-Host "Moved protected route: $name"
    }
  }
}

# The dashboard page becomes protected, but its URL remains /admin.
$dashboard = Join-Path $admin "page.tsx"
$protectedDashboard = Join-Path $protectedGroup "page.tsx"

if (Test-Path $dashboard) {
  if (Test-Path $protectedDashboard) {
    Write-Warning "Skipping dashboard because protected page.tsx already exists."
  } else {
    Move-Item $dashboard $protectedDashboard
    Write-Host "Moved admin dashboard into protected group."
  }
}

Write-Host ""
Write-Host "Do NOT move these shared files:"
Write-Host "  app/admin/AdminNav.tsx"
Write-Host "  app/admin/admin.css"
Write-Host "  app/admin/layout.tsx"
Write-Host ""
Write-Host "Route groups are omitted from URLs, so /admin URLs do not change."
