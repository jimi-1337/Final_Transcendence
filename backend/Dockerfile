FROM node:16.2.0

RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

RUN export NODE_OPTIONS="--max-old-space-size=7168"

COPY package*.json ./

RUN  npm install --legacy-peer-deps

COPY . .

COPY scripts/running.sh .

RUN apt-get update && apt-get install -y vim && npm install pm2@latest -g

RUN npm config set unsafe-perm true

RUN chown -R node /app

USER node

EXPOSE 5000 5555

CMD ["sh", "./scripts/running.sh"]