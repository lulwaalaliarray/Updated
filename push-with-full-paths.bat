@echo off
echo 🚀 PatientCare - GitHub Push (Full Paths)
echo =========================================
echo.

set "GIT_PATH=C:\Users\%USERNAME%\AppData\Local\Programs\Git\bin\git.exe"
set "NODE_PATH=C:\Program Files\nodejs\node.exe"
set "NPM_PATH=C:\Program Files\nodejs\npm.cmd"

echo 📋 Checking installations...

if exist "%GIT_PATH%" (
    echo ✅ Git found
) else (
    echo ❌ Git not found at expected location
    echo Please check if Git is installed
    pause
    exit /b 1
)

if exist "%NODE_PATH%" (
    echo ✅ Node.js found
) else (
    echo ⚠️ Node.js not found at expected location
)

if exist "%NPM_PATH%" (
    echo ✅ npm found
) else (
    echo ⚠️ npm not found at expected location
)

echo.
echo 📋 Getting Git version...
"%GIT_PATH%" --version

echo.
echo 📋 Initializing Git repository (if needed)...
"%GIT_PATH%" init

echo.
echo 📋 Adding files to Git...
"%GIT_PATH%" add .

echo.
echo 📋 Committing changes...
"%GIT_PATH%" commit -m "Update PatientCare: Enhanced admin panel, pagination, and authentication fixes"

echo.
echo 📋 Setting up remote repository...
"%GIT_PATH%" remote remove origin >nul 2>&1
"%GIT_PATH%" remote add origin https://github.com/lulwaalaliarray/Updated.git

echo.
echo 📋 Pushing to GitHub...
echo ⚠️ You may be prompted for GitHub credentials
echo.

"%GIT_PATH%" branch -M main
"%GIT_PATH%" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCCESS! Code pushed to GitHub!
    echo 🔗 https://github.com/lulwaalaliarray/Updated
) else (
    echo.
    echo ❌ Push failed. You may need to:
    echo 1. Set up GitHub authentication (Personal Access Token)
    echo 2. Make sure the repository exists
    echo 3. Check your internet connection
    echo.
    echo 💡 Alternative: Use the web upload method
    echo    Open: GitHub-Upload-Guide.html
)

echo.
echo 📊 Your PatientCare Features:
echo ✅ Enhanced admin panel
echo ✅ Pagination system (15 doctors per page)
echo ✅ Fixed authentication
echo ✅ 30 demo users with medical data
echo ✅ Professional healthcare UI

echo.
pause