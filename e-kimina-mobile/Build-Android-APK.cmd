@echo off
setlocal
cd /d "%~dp0"
set "MOBILE_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "MOBILE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%MOBILE_NODE%" scripts\build-android.cjs
pause
