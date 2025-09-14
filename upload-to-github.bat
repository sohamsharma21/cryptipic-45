@echo off
echo ========================================
echo CryptiPic GitHub Upload Script
echo ========================================
echo.

echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding all files to staging...
git add .

echo.
echo Step 3: Creating initial commit...
git commit -m "Initial commit: CryptiPic Defense Steganography Platform"

echo.
echo Step 4: Setting main branch...
git branch -M main

echo.
echo ========================================
echo IMPORTANT: Before proceeding...
echo ========================================
echo 1. Create a new repository on GitHub.com
echo 2. Copy the repository URL
echo 3. Replace YOUR_USERNAME in the next command
echo 4. Run: git remote add origin https://github.com/YOUR_USERNAME/cryptipic-defense-platform.git
echo 5. Run: git push -u origin main
echo ========================================
echo.

echo Repository initialized successfully!
echo Next steps:
echo 1. Create GitHub repository
echo 2. Add remote origin
echo 3. Push to GitHub
echo.

pause
