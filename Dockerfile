# Multi-stage build for Next.js SSG deployment

# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies (needed for build:grammar and validate:exercises)
RUN npm ci

# Copy source files needed for build
COPY tsconfig.json ./
COPY grammar ./grammar
COPY src ./src
COPY scripts ./scripts

# Copy web application
COPY web ./web

# Install web dependencies
WORKDIR /app/web
RUN npm ci

# Build the static site (from root directory to run full build chain)
WORKDIR /app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy the static files from builder
COPY --from=builder /app/web/out /usr/share/nginx/html

# Create nginx config to serve on port 8080 (required by fly.toml)
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ $uri.html =404; \
    } \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

