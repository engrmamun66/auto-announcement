async function startWithDevices() {
    const { default: ZKLib } = await import("node-zklib");
  
    const DEVICE_IP = "192.168.68.102";
    const DEVICE_PORT = 4370;
    const RECONNECT_DELAY = 5000; // 5 seconds between reconnect attempts
    const POLL_INTERVAL = 2000;
  
    let zk;
    let isConnecting = false;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
  
    async function createConnection() {
      if (isConnecting) return null;
      isConnecting = true;
  
      try {
        console.log(`⌛ Connecting to ${DEVICE_IP}...`);
        // Try both UDP (1) and TCP (0) if needed
        zk = new ZKLib(DEVICE_IP, DEVICE_PORT, 10000, 5000, 1);
        
        // Try to create socket with timeout
        await Promise.race([
          zk.createSocket(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000))
        ]);
  
        console.log("✅ Connected to ZKTeco device");
        reconnectAttempts = 0;
        return zk;
      } catch (err) {
        console.error(`❌ Connection failed (attempt ${reconnectAttempts + 1}):`, err.message);
        return null;
      } finally {
        isConnecting = false;
      }
    }
  
    async function reconnect() {
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error("⚠️ Max reconnection attempts reached. Please check device connection.");
        return;
      }
  
      reconnectAttempts++;
      const delay = RECONNECT_DELAY * Math.min(reconnectAttempts, 3); // Exponential backoff
      console.log(`🔄 Reconnecting in ${delay/1000} seconds...`);
  
      await new Promise(resolve => setTimeout(resolve, delay));
      return await createConnection();
    }
  
    async function getLatestLogs() {
      if (!zk) {
        await reconnect();
        return [];
      }
  
      try {
        const logs = await zk.getAttendances();
        const now = Date.now();
        return logs.data.filter(
          (log) => now - new Date(log.recordTime).getTime() <= 10000
        );
      } catch (err) {
        console.error("❌ Error fetching logs:", err.message);
        await reconnect();
        return [];
      }
    }
  
    // Initial connection
    await createConnection();
  
    // Polling with error handling
    const pollInterval = setInterval(async () => {
      try {
        const latestLogs = await getLatestLogs();
        console.log(latestLogs.length ? latestLogs : "⚠️ No new logs");
      } catch (err) {
        console.error("⚠️ Polling error:", err.message);
      }
    }, POLL_INTERVAL);
  
    // Cleanup on process exit
    process.on('SIGINT', () => {
      clearInterval(pollInterval);
      if (zk) {
        zk.disconnect();
        console.log("🔌 Disconnected from device");
      }
      process.exit();
    });
  }
  
  module.exports = { startWithDevices };