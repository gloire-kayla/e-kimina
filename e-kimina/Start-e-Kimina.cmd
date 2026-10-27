@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% equ 0 (
  set "EKIMINA_NODE=node"
) else (
  set "EKIMINA_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)
if not "%EKIMINA_NODE%"=="node" if not exist "%EKIMINA_NODE%" (
  echo Install Node.js 24 or newer, then run this launcher again.
  pause
  exit /b 1
)
echo Open http://127.0.0.1:4173 after the server starts.
echo If a new server starts, keep this window open for recovery test codes.
echo No SMS is sent. Press Ctrl+C to stop e-Kimina.
"%EKIMINA_NODE%" server.mjs
pause
