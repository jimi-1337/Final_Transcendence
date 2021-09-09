export NODE_OPTIONS="--max-old-space-size=7168"

# Create The Database
npx prisma migrate dev

# Starting The Backend
npm run build
pm2 start npm --name "backend" -- run start:prod

# Viewing The Database
npx prisma studio &

# Backend Logs
pm2 logs