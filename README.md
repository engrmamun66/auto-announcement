# auto-announcement
`
pm2 start
or 
npm start 
`

#auto restartable pm2 server
`
pm2 start server.js --name auto-announcement --watch --restart-delay 2000 
pm2 start server.js --name auto-announcement --watch --max-restarts 10 --restart-delay 2000 
`

# Check IP address
win: ipconfig
mac: ifconfig   --------- # note: show en0
  
# Check connect (command IP PORT)
win: ping -vz 192.168.68.102 4370ddf
mac: nc -vz 192.168.68.102 4370
