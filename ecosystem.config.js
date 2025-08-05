
module.exports = {
  apps: [
    {
      name: 'auto-announcement',       // ✅ updated name
      script: './server.js',
      instances: 1,
      autorestart: true,
      watch: false,                     // ✅ enable watch
      max_restarts: 10,                // ✅ max restarts
      restart_delay: 2000,             // ✅ delay between restarts (ms)
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
    }
  ]
};
