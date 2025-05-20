@REM @echo off
start pm2 start ecosystem.config.js
start http://localhost:2323/app/#/
@REM only closing this file
exit /b
