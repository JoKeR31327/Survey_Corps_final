# 1. Base image
FROM node:18-alpine

# 2. App directory
WORKDIR /app

# 3. Copy dependency files first
COPY package*.json ./

# 4. Install prod dependencies
RUN npm install --only=production

# 5. Copy source code
COPY src ./src
COPY sql ./sql

# 6. Expose HTTP port
EXPOSE 8080

# 7. Start service
CMD ["node", "src/server.js"]
