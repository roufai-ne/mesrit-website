# setup-strapi-backend.ps1

Write-Host "=== MESRIT Strapi Backend Setup ===" -ForegroundColor Cyan

# Check for Node.js
$nodeVersion = node -v
Write-Host "Detected Node.js version: $nodeVersion"

# Define destination inside the current project
# Since we are restricted to the current workspace, we will create 'backend' inside the current folder.
$backendPath = Join-Path -Path $PWD -ChildPath "backend"

Write-Host "This script will create a new Strapi project at: $backendPath"
Write-Host "This is located INSIDE your current folder 'mesrit-website'."

$confirmation = Read-Host "Do you want to proceed? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Aborted."
    exit
}

# Check if directory already exists
if (Test-Path -Path $backendPath) {
    Write-Host "Error: The folder 'backend' already exists." -ForegroundColor Red
    exit
}

# Create Strapi Project
Write-Host "Creating Strapi app (this may take a few minutes)..."
# We use --quickstart for SQLite.
# We explicitly set the path to ./backend
npx create-strapi-app@latest backend --quickstart --no-run

Write-Host "Installing recommended plugins..."
Set-Location "$backendPath"

if (Test-Path "package.json") {
    # Install Meilisearch plugin
    npm install strapi-plugin-meilisearch

    # Install Transformer plugin (often useful)
    npm install strapi-plugin-transformer

    Write-Host "=== Setup Complete ===" -ForegroundColor Green
    Write-Host "To start Strapi:"
    Write-Host "1. cd backend"
    Write-Host "2. npm run develop"
    Write-Host "3. Create your admin user."
} else {
    Write-Host "Error: Strapi installation seems to have failed (package.json not found in backend)." -ForegroundColor Red
}
