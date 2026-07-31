@echo off
:menu
cls
echo ======================================================
echo          HE THONG CONG CU DONG BO TMA STUDY
echo ======================================================
echo  [1] Dong bo De thi tu Local len Web (Upload Exams)
echo  [2] Dong bo Anh minh hoa tu Local len Web (Upload Assets)
echo  [3] TAI TOAN BO DE THI & ANH VE MAY (Backup / Download)
echo  [4] CAP NHAT GIAO DIEN CODE WEB (Deploy to Pages)
echo  [5] Thoat
echo ======================================================
set /p choice=Nhap lua chon cua ban (1-5): 

if "%choice%"=="1" goto sync_exams
if "%choice%"=="2" goto sync_assets
if "%choice%"=="3" goto backup
if "%choice%"=="4" goto deploy
if "%choice%"=="5" exit

echo Lua chon khong hop le!
pause
goto menu

:sync_exams
cls
echo Khoi dong dong bo de thi len Web...
node "%~dp0scratch\sync_exams_to_r2.js"
pause
goto menu

:sync_assets
cls
echo Khoi dong dong bo hinh anh len Web...
node "%~dp0scratch\sync_assets_to_r2.js"
pause
goto menu

:backup
cls
echo Khoi dong tai toan bo de thi va anh tu Web ve may (Backup)...
node "%~dp0scratch\sync_r2_to_local.js"
pause
goto menu

:deploy
cls
echo 1. Dang dong goi giao dien web (deploy-web)...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\prepare-deploy.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ LOI: Dong goi giao dien that bai.
    pause
    goto menu
)
echo.
echo 2. Dang day giao dien len Cloudflare Pages...
cmd /c npx wrangler pages deploy "%~dp0deploy-web" --project-name=tma-study
pause
goto menu
