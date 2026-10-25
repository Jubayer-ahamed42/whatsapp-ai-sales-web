@echo off
title Instant WhatsApp AI Sales Rep Sandbox - Be Smart With AI
echo ==========================================================
echo   Instant WhatsApp AI Sales Rep Sandbox (সেলস ইঞ্জিন)
echo   Be Smart With AI - Founder: Jubayer Ahamed
echo ==========================================================
echo.
echo Launching standalone Sandbox in your default browser...
start "" "%~dp0index.html"
echo.
echo Starting local API server at http://localhost:8085 ...
python "%~dp0server.py" 8085
pause
