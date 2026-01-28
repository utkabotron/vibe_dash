module.exports = {
  apps: [{
    name: 'vibe-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/root/Hosting_bot/dashboard',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      GOOGLE_SHEETS_CREDENTIALS_PATH: '/root/Hosting_bot/dashboard/vibebot-464607-8d0d17c22710.json',
      SPREADSHEET_ID: process.env.SPREADSHEET_ID || 'your-spreadsheet-id'
    }
  }]
}
