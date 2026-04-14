# Use official Node.js LTS (Long Term Support) image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5007/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start application
CMD ["npm", "start"]
