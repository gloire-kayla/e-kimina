@echo off
setlocal
cd /d "%~dp0"
set "EKIMINA_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "EKIMINA_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%EKIMINA_NODE%" scripts\connect-android-apk.cjs
pause
