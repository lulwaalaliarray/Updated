@echo off
title PatientCare - Push to GitHub
color 0A

echo.
echo     🚀 PATIENTCARE - PUSH TO GITHUB 🚀
echo     ===================================
echo.
echo     Target: https://github.com/lulwaalaliarray/Updated
echo.

pause

echo 📋 Using full paths to Git and Node.js...
echo.

set "GIT=C:\Users\%USERNAME%\AppData\Local\Programs\Git\bin\git.exe"

echo ✅ Git version:
"%GIT%" --version
echo.

echo 📋 Adding all files...
"%GIT%" add .

echo 📋 Committing changes...
"%GIT%" commit -m "Update PatientCare: Enhanced admin panel, pagination, and authentication fixes"

echo 📋 Setting remote repository...
"%GIT%" remote remove origin 2>nul
"%GIT%" remote add origin https://github.com/lulwaalaliarray/Updated.git

echo 📋 Pushing to GitHub...
echo.
echo ⚠️  You may need to enter your GitHub username and password/token
echo.

"%GIT%" branch -M main
"%GIT%" push -u origin main

echo.
if %errorlevel% equ 0 (
    echo 🎉 SUCCESS! Your PatientCare platform is now on GitHub!
    echo.
    echo 🔗 View at: https://github.com/lulwaalaliarray/Updated
    echo.
    echo ✅ What was uploaded:
    echo    - Enhanced Admin Panel
    echo    - Pagination System (15 doctors per page)
    echo    - Fixed Authentication
    echo    - 30 Demo Users with Medical Data
    echo    - Professional Healthcare UI
) else (
    echo ❌ Push failed!
    echo.
    echo 💡 Try these solutions:
    echo    1. Make sure repository exists on GitHub
    echo    2. Use Personal Access Token instead of password
    echo    3. Check internet connection
    echo    4. Use web upload: open GitHub-Upload-Guide.html
)

echo.
pause