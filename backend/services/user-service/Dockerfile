# 1. Base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files first (for layer caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --only=production

# 5. Copy source code
COPY src ./src
COPY sql ./sql

# 6. Expose HTTP port
EXPOSE 8080

# 7. Start the service
CMD ["node", "src/server.js"]
