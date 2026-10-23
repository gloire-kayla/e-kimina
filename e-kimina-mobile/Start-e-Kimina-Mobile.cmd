@echo off
setlocal
cd /d "%~dp0"
set "MOBILE_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "MOBILE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist node_modules\expo\bin\cli (
  echo Install Node.js, then run npm install in this folder first.
  pause
  exit /b 1
)
set "EXPO_NO_TELEMETRY=1"
"%MOBILE_NODE%" node_modules\expo\bin\cli start --localhost --port 8081
pause
