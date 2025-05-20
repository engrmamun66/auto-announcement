@echo off
start http://localhost:2323/app/#/
pm2 start
timeout /t 2 >nul
exit
