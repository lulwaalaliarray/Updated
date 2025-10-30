# PatientCare - GitHub Push Script (Using Full Paths)
# This script uses full paths to Git and npm since they're not in PATH

Write-Host "🚀 PatientCare - GitHub Push Script (Full Paths)" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Define full paths to executables
$gitPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Git\bin\git.exe"
$nodePath = "C:\Program Files\nodejs\node.exe"
$npmPath = "C:\Program Files\nodejs\npm.cmd"

# Check if executables exist
Write-Host "📋 Checking installations..." -ForegroundColor Yellow

if (Test-Path $gitPath) {
    Write-Host "✅ Git found at: $gitPath" -ForegroundColor Green
} else {
    Write-Host "❌ Git not found at expected location" -ForegroundColor Red
    $gitPath = Read-Host "Enter full path to git.exe"
}

if (Test-Path $nodePath) {
    Write-Host "✅ Node.js found at: $nodePath" -ForegroundColor Green
} else {
    Write-Host "⚠️ Node.js not found at expected location" -ForegroundColor Yellow
}

if (Test-Path $npmPath) {
    Write-Host "✅ npm found at: $npmPath" -ForegroundColor Green
} else {
    Write-Host "⚠️ npm not found at expected location" -ForegroundColor Yellow
}

Write-Host ""

# Get Git version
try {
    $gitVersion = & $gitPath --version
    Write-Host "Git version: $gitVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Could not run Git" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Configure Git user (if needed)
Write-Host "📋 Configuring Git..." -ForegroundColor Yellow

try {
    $userName = & $gitPath config --global user.name 2>$null
    if (-not $userName) {
        $inputName = Read-Host "Enter your name for Git commits"
        & $gitPath config --global user.name "$inputName"
        Write-Host "✅ Git user name configured" -ForegroundColor Green
    } else {
        Write-Host "✅ Git user name: $userName" -ForegroundColor Green
    }

    $userEmail = & $gitPath config --global user.email 2>$null
    if (-not $userEmail) {
        $inputEmail = Read-Host "Enter your email for Git commits"
        & $gitPath config --global user.email "$inputEmail"
        Write-Host "✅ Git user email configured" -ForegroundColor Green
    } else {
        Write-Host "✅ Git user email: $userEmail" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Could not configure Git user" -ForegroundColor Yellow
}

Write-Host ""

# Initialize Git repository if needed
Write-Host "📋 Checking Git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "⚠️ No Git repository found. Initializing..." -ForegroundColor Yellow
    & $gitPath init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository found" -ForegroundColor Green
}

Write-Host ""

# Add files to Git
Write-Host "📋 Adding files to Git..." -ForegroundColor Yellow
& $gitPath add .
Write-Host "✅ Files added to staging area" -ForegroundColor Green

Write-Host ""

# Commit changes
Write-Host "📋 Committing changes..." -ForegroundColor Yellow
$commitMessage = "Update PatientCare: Enhanced admin panel, pagination, and authentication fixes"
try {
    & $gitPath commit -m "$commitMessage"
    Write-Host "✅ Changes committed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Commit may have failed (possibly no changes to commit)" -ForegroundColor Yellow
}

Write-Host ""

# Set up remote repository
Write-Host "📋 Setting up remote repository..." -ForegroundColor Yellow
try {
    & $gitPath remote remove origin 2>$null
} catch {
    # Remote might not exist, that's okay
}

& $gitPath remote add origin https://github.com/lulwaalaliarray/Updated.git
Write-Host "✅ Remote repository configured" -ForegroundColor Green

Write-Host ""

# Push to GitHub
Write-Host "📋 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "⚠️ You may be prompted for GitHub credentials" -ForegroundColor Yellow
Write-Host ""

try {
    & $gitPath branch -M main
    & $gitPath push -u origin main
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your code has been pushed to GitHub!" -ForegroundColor Green
    Write-Host "🔗 Repository: https://github.com/lulwaalaliarray/Updated" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Push failed. This might be due to:" -ForegroundColor Red
    Write-Host "1. Authentication issues (need GitHub token)" -ForegroundColor Yellow
    Write-Host "2. Repository doesn't exist or you don't have access" -ForegroundColor Yellow
    Write-Host "3. Network connectivity issues" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Try these solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure repository exists: https://github.com/lulwaalaliarray/Updated" -ForegroundColor Cyan
    Write-Host "2. Use Personal Access Token instead of password" -ForegroundColor Cyan
    Write-Host "3. Or use the web upload method (GitHub-Upload-Guide.html)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📊 Your PatientCare Platform Features:" -ForegroundColor Yellow
Write-Host "✅ Enhanced admin dashboard with persistent navigation" -ForegroundColor Green
Write-Host "✅ Pagination for doctor listings (15 per page)" -ForegroundColor Green
Write-Host "✅ Fixed authentication issues (single-click login)" -ForegroundColor Green
Write-Host "✅ 30 demo users with realistic medical data" -ForegroundColor Green
Write-Host "✅ Professional healthcare UI improvements" -ForegroundColor Green

Write-Host ""
Read-Host "Press Enter to exit"