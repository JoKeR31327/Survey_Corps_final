# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_USER_API
ARG VITE_ORDER_API
ARG VITE_INVENTORY_API

ENV VITE_USER_API=${VITE_USER_API}
ENV VITE_ORDER_API=${VITE_ORDER_API}
ENV VITE_INVENTORY_API=${VITE_INVENTORY_API}

RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
