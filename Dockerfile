# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 7778

CMD ["node", "server.js"]
