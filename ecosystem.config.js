module.exports = {
  apps: [
    {
      name: 'announcment',
      script: './server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
    }
  ]
};
