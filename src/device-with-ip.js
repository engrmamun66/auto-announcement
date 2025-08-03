async function startWithDevices() {
    try {
      const { default: ZKLib } = await import("node-zklib");
      
      const DEVICE_IP = "192.168.68.102";
      const DEVICE_PORT = 4370;
      const PROTOCOL = 0; // Force TCP
      const TIMEOUT = 30000; // 30 seconds
  
      console.log(`⌛ Initializing ZKTeco connection (macOS)...`);
      
      // Debug: Verify network access
      console.log("🔍 Running network pre-check...");
      const { execSync } = require('child_process');
      try {
        execSync(`ping -c 4 ${DEVICE_IP}`);
        execSync(`nc -vz ${DEVICE_IP} ${DEVICE_PORT}`);
        console.log("✅ Network pre-check passed");
      } catch (e) {
        console.error("❌ Network check failed:", e.message);
        return;
      }
  
      const zk = new ZKLib(DEVICE_IP, DEVICE_PORT, TIMEOUT, TIMEOUT, PROTOCOL);
      
      // macOS-specific socket settings
      if (process.platform === 'darwin') {
        zk._socket?.setKeepAlive?.(true, 60000);
      }
  
      console.log("🔄 Creating socket connection...");
      await zk.createSocket();
      
      // Verify communication
      console.log("🔗 Verifying device protocol...");
      const info = await zk.getInfo();
      console.log("✅ Connected to device:", {
        model: info.deviceName,
        firmware: info.firmwareVersion
      });
  
      // Start polling
      setInterval(async () => {
        try {
          const logs = await zk.getAttendances();
          const recent = logs.data.filter(log => 
            Date.now() - new Date(log.recordTime).getTime() <= 10000
          );
          if (recent.length) console.log("📝 New logs:", recent);
        } catch (e) {
          console.error("⚠️ Polling error:", e.message);
        }
      }, 2000);
  
    } catch (err) {
      console.error("🚨 Critical error:", err.stack || err.message);
      
      // macOS-specific fallback suggestion
      if (process.platform === 'darwin') {
        console.log("\n🔧 macOS Troubleshooting Tips:");
        console.log("1. Try running with sudo: sudo node your_script.js");
        console.log("2. Check firewall: sudo /usr/libexec/ApplicationFirewall/socketfilterfw --listapps");
        console.log("3. Test with Python: python3 -c 'import socket; s=socket.socket(); s.connect((\"192.168.68.102\",4370)); print(\"OK\")'");
      }
    }
  }
  
module.exports = { startWithDevices }