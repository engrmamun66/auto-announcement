@REM ========= For Windows =====================
@echo off
@REM start http://localhost:2323/app/#/
@REM start chrome http://localhost:2323/app/#/
start microsoft-edge:http://localhost:2323/app/#/
pm2 start
@REM timeout /t 2 >nul
exit
 