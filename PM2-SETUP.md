# Keep Backend Running 24/7 - PM2 Setup (VPS Only)

If you're using a VPS (DigitalOcean, AWS EC2, etc.), use PM2:

## Install PM2
```bash
npm install -g pm2
```

## Start Backend
```bash
cd /path/to/artnest
pm2 start backend/server.js --name artnest-backend
```

## Auto-restart on crashes
```bash
pm2 startup
pm2 save
```

## Monitor
```bash
pm2 status
pm2 logs artnest-backend
pm2 monit
```

## Commands
```bash
pm2 restart artnest-backend  # Restart
pm2 stop artnest-backend     # Stop
pm2 delete artnest-backend   # Remove
```

This keeps your server running forever, auto-restarts on crashes, and survives server reboots.
