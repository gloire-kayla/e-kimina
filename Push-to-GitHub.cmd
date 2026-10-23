@echo off
setlocal
cd /d "%~dp0"
echo Uploading the prepared e-Kimina backup to GitHub...
echo Complete GitHub sign-in in your browser if prompted.
git -c safe.directory="%~dp0." push -u origin main
if errorlevel 1 (
  echo.
  echo Upload did not finish. Copy the error text so we can resolve it.
) else (
  echo.
  echo Upload completed: https://github.com/gloire-kayla/e-kimina
)
pause

