FROM node:16.2.0

WORKDIR /app

COPY package*.json ./

RUN  npm install --legacy-peer-deps

COPY . .

COPY scripts/running.sh .

RUN apt-get update && apt-get install -y vim && npm install pm2@latest -g

EXPOSE 3000

CMD ["sh", "./scripts/running.sh"]