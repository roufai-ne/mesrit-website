module.exports = {
  apps: [{
    name: 'mesrit-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/mesrit-website',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/mesrit-website-error.log',
    out_file: '/var/log/pm2/mesrit-website-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
}