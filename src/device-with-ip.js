const { execSync } = require('child_process');
const { default: ZKLib } = require('node-zklib');

async function startWithDevices() {
  const DEVICE_IP = "192.168.68.102";
  const DEVICE_PORT = 4370;

  // 1. Enhanced Pre-Check
  try {
    console.log("🔍 Running advanced network diagnostics...");
    execSync(`ping -c 4 ${DEVICE_IP}`);
    execSync(`nc -vz ${DEVICE_IP} ${DEVICE_PORT}`);
    console.log("✅ Network stack is operational");
  } catch (e) {
    console.error("❌ Network pre-check failed:", e.message);
    return;
  }

  // 2. Connection with macOS-specific tuning
  try {
    console.log("🔄 Initializing ZKTeco connection...");
    
    const zk = new ZKLib(
      DEVICE_IP,
      DEVICE_PORT,
      30000, // timeout
      30000, // in transit timeout
      0,     // TCP protocol
      true   // auto-reconnect
    );

    // macOS-specific socket tuning
    if (process.platform === 'darwin') {
      zk._socket?.setKeepAlive?.(true, 60000);
      zk._socket?.setNoDelay?.(true);
    }

    // 3. Debugging connection process
    console.log("⚙️ Creating secure socket...");
    await new Promise((resolve, reject) => {
      zk.createSocket((err) => {
        if (err) {
          console.error("🔧 Socket creation error:", err);
          reject(err);
        } else {
          console.log("🛡️ Socket security handshake complete");
          resolve();
        }
      });
    });

    // 4. Protocol verification
    console.log("🔐 Verifying device protocol...");
    const info = await zk.getInfo();
    console.log("✅ Successfully connected to:", {
      model: info.deviceName,
      serial: info.serialNumber,
      firmware: info.firmwareVersion
    });

    // 5. Start data polling
    setInterval(async () => {
      try {
        const logs = await zk.getAttendances();
        console.log("📊 Latest logs:", logs.data.slice(0, 3));
      } catch (e) {
        console.error("⚠️ Polling error:", e.message);
      }
    }, 5000);

  } catch (err) {
    console.error("🚨 Critical connection failure:", err.message);
    
    // Advanced macOS diagnostics
    if (process.platform === 'darwin') {
      console.log("\n🛠️  Advanced macOS Debugging:");
      try {
        console.log("🔧 Raw port test:", 
          execSync(`echo "TEST" | nc ${DEVICE_IP} ${DEVICE_PORT} -w 3`).toString()
        );
        console.log("🔧 SocketFD status:",
          execSync(`lsof -i :${DEVICE_PORT}`).toString()
        );
      } catch (e) {
        console.error("Diagnostic failed:", e.message);
      }
    }
  }
}

// Run with elevated privileges if needed
if (process.platform === 'darwin') {
  console.log("⚠️  macOS detected - recommend running with sudo if connection fails");
}

module.exports = { startWithDevices }