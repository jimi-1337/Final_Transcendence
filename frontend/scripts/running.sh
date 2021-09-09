export NODE_OPTIONS="--max-old-space-size=7168"

# Starting Frontend
npm run build
pm2 start npm --name "frontend" -- run start

# Frontend Logs
pm2 logs
