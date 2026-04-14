# 🐳 Docker Setup Guide for GulmiGang

Complete Docker architecture and setup guide for the GulmiGang Instagram-like social network platform.

## Complete Docker Architecture

### Services Overview

| Service | Port | Description | Image |
|---------|------|-------------|-------|
| **Frontend** | 5178 | Vue 3 + Vite UI | node:20-alpine |
| **Backend** | 5007 | Express API | node:20-alpine |
| **MongoDB** | 27017 | Database | mongo:latest |

### Network Architecture

```
Internet
    ↓
┌─────────────────────────────────────┐
│   Docker Host (your computer)       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   gulmigang-network          │  │
│  │   (bridge network)           │  │
│  │                              │  │
│  │  ┌────────┐  ┌────────┐    │  │
│  │  │Frontend│  │Backend │    │  │
│  │  │:5178   │→ │:5007   │    │  │
│  │  └────────┘  └───┬────┘    │  │
│  │                  ↓          │  │
│  │            ┌──────────┐    │  │
│  │            │ MongoDB  │    │  │
│  │            │ :27017   │    │  │
│  │            └──────────┘    │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Installation Steps

### 1. Install Docker

**Windows:**
1. Download Docker Desktop from https://docker.com
2. Install and restart your computer
3. Verify installation: `docker --version`

**macOS:**
```bash
brew install --cask docker
# or download from https://docker.com
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and log back in for group changes to take effect
```

### 2. Clone and Setup

```bash
# Clone repository
git clone https://github.com/Aakashpuri786/GulmiGang.git
cd GulmiGang

# Run setup script (Linux/macOS)
bash setup-docker.sh

# OR manually for Windows/all platforms:
docker-compose build
docker-compose up -d
```

### 3. Verify Installation

```bash
# Check running containers (should show 3)
docker-compose ps

# Expected output:
# NAME                    STATUS              PORTS
# gulmigang-frontend      Up 10 seconds       0.0.0.0:5178->5178/tcp
# gulmigang-backend       Up 15 seconds       0.0.0.0:5007->5007/tcp
# gulmigang-mongodb       Up 20 seconds       0.0.0.0:27017->27017/tcp

# Test backend health
curl http://localhost:5007/health

# Test frontend
open http://localhost:5178  # macOS
start http://localhost:5178 # Windows
xdg-open http://localhost:5178 # Linux
```

## Common Commands

### Starting and Stopping

```bash
# Start all services (detached mode - runs in background)
docker-compose up -d

# Start with logs visible (attached mode)
docker-compose up

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (CAUTION: deletes data)
docker-compose down -v

# Remove everything including images
docker-compose down -v --rmi all
```

### Viewing Logs

```bash
# View all services logs (follow mode - shows new logs in real-time)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# View last 100 lines
docker-compose logs --tail=100 backend

# View logs without following (just show existing logs)
docker-compose logs backend
```

### Rebuilding

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild without cache (ensures fresh dependencies)
docker-compose build --no-cache backend

# Rebuild and restart
docker-compose up -d --build

# Force rebuild even if nothing changed
docker-compose build --no-cache --force-rm
```

### Accessing Containers

```bash
# Execute command in container
docker-compose exec backend npm install package-name

# Open shell/terminal in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Open MongoDB shell (mongosh)
docker-compose exec mongodb mongosh -u admin -p gulmigang2024

# Run commands as different user
docker-compose exec -u root backend apk add --no-cache curl
```

### Viewing Status

```bash
# Show all running containers
docker-compose ps

# Show detailed output
docker-compose ps -a

# Show container resource usage
docker stats

# Show specific container stats
docker stats gulmigang-backend
```

## Troubleshooting

### Port Already in Use

**Error:** `Error response from daemon: driver failed programming external connectivity on endpoint gulmigang-backend`

**Solution:**

Find and kill the process using the port:

```bash
# On macOS/Linux - Find what's using port 5007
lsof -i :5007

# Kill the process
kill -9 PID

# Or stop Docker and remove port mappings
docker-compose down
# Edit docker-compose.yml to use different ports
# Change ports: - "5007:5007" to - "5008:5007"
docker-compose up -d
```

**Windows:**
```bash
# Find process using port 5007
netstat -ano | findstr :5007

# Kill process
taskkill /PID PID_NUMBER /F

# Or change ports in docker-compose.yml
```

### MongoDB Connection Issues

**Error:** `MongooseError: connect ECONNREFUSED 127.0.0.1:27017`

**Error:** `MongooseError: getaddrinfo ENOTFOUND mongodb`

**Solution:**

```bash
# Check MongoDB is running
docker-compose ps | grep mongodb

# View MongoDB logs
docker-compose logs mongodb

# MongoDB might not be healthy, check health status
docker-compose ps

# If MongoDB shows "unhealthy", wait and try again
# MongoDB can take 30-40 seconds to start

# Or restart MongoDB
docker-compose restart mongodb
docker-compose logs -f mongodb  # Wait for startup messages

# Test MongoDB directly
docker-compose exec mongodb mongosh -u admin -p gulmigang2024 --eval "db.adminCommand('ping')"

# If still failing, clean and restart
docker-compose down
docker volume rm gulmigang_mongodb_data
docker volume rm gulmigang_mongodb_config
docker-compose up -d -V
```

### Backend Not Starting

**Error:** `backend_1 exited with code 1`

**Solution:**

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. MongoDB not ready - MongoDB has startup delay (40s health check)
#    Solution: Wait 60 seconds and restart backend
docker-compose restart backend

# 2. Module not found error
#    Solution: Rebuild with fresh dependencies
docker-compose build --no-cache backend
docker-compose up -d

# 3. Port already in use
#    Solution: See "Port Already in Use" section

# 4. MONGO_URI environment variable issue
#    Solution: Check backend/.env file exists and has correct MONGO_URI
cat backend/.env
```

### Frontend Not Loading

**Error:** Blank page or "Cannot GET /"

**Solution:**

```bash
# Check if container is running
docker-compose ps frontend

# Check logs
docker-compose logs frontend

# Check browser network tab for specific errors
# Hard refresh browser cache:
# Windows/Linux: Ctrl+Shift+R
# macOS: Cmd+Shift+R

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Check if port 5178 is accessible
curl http://localhost:5178

# If containers are running but not accessible, check networking
docker network ls
docker network inspect gulmigang-network
```

### Build Failures

**Error:** `ERROR: Service 'backend' failed to build`

**Solution:**

```bash
# Clear build cache
docker system prune -a

# Rebuild with verbose output
docker-compose build --no-cache backend --verbose

# Check Dockerfile syntax
cat backend/Dockerfile

# Check if all required files exist
ls -la backend/package.json
ls -la backend/package-lock.json

# Rebuild all services
docker-compose build --no-cache
```

### Clean Everything and Start Fresh

**Nuclear Option** - Only use when desperate!

```bash
# Stop all containers
docker-compose down

# Remove all volumes (DELETES ALL DATA!)
docker volume prune -a --force

# Remove specific volumes
docker volume rm gulmigang_mongodb_data
docker volume rm gulmigang_mongodb_config
docker volume rm gulmigang_backend_uploads

# Remove all images
docker-compose down --rmi all

# Remove all unused Docker resources
docker system prune -a --volumes --force

# Rebuild everything from scratch
docker-compose build --no-cache --force-rm
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:5007/health
```

## Performance Optimization

### Reduce Build Time

```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose build

# Or on Windows (PowerShell)
$env:DOCKER_BUILDKIT=1
docker-compose build
```

### Limit Resource Usage

Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
  
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Monitor Resource Usage

```bash
# Real-time resource stats
docker stats

# Show stats for specific containers
docker stats gulmigang-backend gulmigang-frontend

# Format the output
docker stats --format "{{.Container}}: {{.MemUsage}} / {{.MemLimit}}"
```

### Prune Unused Resources

```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove everything unused (be careful!)
docker system prune -a --volumes
```

## Data Persistence

### Backup MongoDB Data

```bash
# Create backup directory
mkdir -p mongodb-backup

# Backup MongoDB data
docker-compose exec mongodb mongodump -u admin -p gulmigang2024 --authenticationDatabase admin --out /data/backup

# Copy backup to host
docker cp gulmigang-mongodb:/data/backup ./mongodb-backup/

# Verify backup was created
ls -la ./mongodb-backup/backup/
```

### Restore MongoDB Data

```bash
# Copy backup into container
docker cp ./mongodb-backup/backup gulmigang-mongodb:/data/

# Restore data
docker-compose exec mongodb mongorestore -u admin -p gulmigang2024 --authenticationDatabase admin /data/backup
```

### Backup User Uploads

```bash
# Create backup directory
mkdir -p uploads-backup

# Copy uploads from backend
docker cp gulmigang-backend:/usr/src/app/uploads ./uploads-backup/

# Verify
ls -la ./uploads-backup/uploads/
```

### Restore User Uploads

```bash
# Copy uploads back to container
docker cp ./uploads-backup/uploads gulmigang-backend:/usr/src/app/

# Verify
docker-compose exec backend ls -la uploads/
```

## Development vs Production

### Development Mode

```bash
# Use dev compose file with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or using Makefile
make dev

# Features:
# - Hot reload enabled for both frontend and backend
# - Source code mounted as volumes (changes reflected immediately)
# - All development dependencies installed
# - Debug mode enabled
# - Console logs visible
```

### Production Mode

```bash
# Use production compose file (optimized builds)
docker-compose -f docker-compose.yml up -d

# Or using Makefile
make up

# Features:
# - Optimized builds (multi-stage builds for frontend)
# - No source code volumes (immutable containers)
# - Production dependencies only
# - Compressed assets
# - Health checks enabled
# - No debug output
```

## Using Environment Variables

### Create .env Files

**backend/.env:**
```env
NODE_ENV=development
PORT=5007
MONGO_URI=mongodb://admin:gulmigang2024@mongodb:27017/gulmigang?authSource=admin
JWT_SECRET=your-super-secret-key-change-in-production
FRONTEND_URL=http://localhost:5178
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5007/api
VITE_WS_URL=http://localhost:5007
VITE_APP_NAME=GulmiGang
```

### Override in Docker Compose

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      NODE_ENV: production
      PORT: 5007
      # Can also reference .env file
      # env_file: ./backend/.env
```

## Security Best Practices

### 1. Change Default Credentials

```bash
# Edit backend/.env
MONGODB_URI=mongodb://CHANGE_USER:CHANGE_PASSWORD@mongodb:27017/...
JWT_SECRET=GENERATE_NEW_LONG_SECRET_KEY
```

### 2. Don't Expose Unnecessary Ports

```yaml
services:
  mongodb:
    # Remove this for production
    # ports:
    #   - "27017:27017"
    # Only expose to localhost in production
    # ports:
    #   - "127.0.0.1:27017:27017"
```

### 3. Use Docker Secrets

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  mongodb:
    environment:
      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/db_password
```

### 4. Enable HTTPS/SSL

Add to nginx.conf for production:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

### 5. Set Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

## Health Monitoring

### Health Check Status

```bash
# Check service health
docker-compose ps

# Look for "(healthy)" or "(unhealthy)" status

# Detailed health status
docker inspect gulmigang-backend | grep -A 10 Health

# Test health endpoint
curl -v http://localhost:5007/health

# Expected response:
# HTTP/1.1 200 OK
# {"uptime": 123.456, "message": "OK", "mongodb": "connected"}
```

### Monitor in Real-time

```bash
# Watch container status
watch docker-compose ps

# Or in PowerShell (Windows)
while($true) { docker-compose ps; Start-Sleep 2; clear }
```

## Makefile Quick Reference

```bash
make help           # Show all available commands
make build          # Build all Docker images
make up             # Start services in background
make dev            # Start services with hot reload
make down           # Stop services
make logs           # View logs from all services
make logs-backend   # View backend logs only
make logs-frontend  # View frontend logs only
make logs-db        # View MongoDB logs
make restart        # Restart all services
make clean          # Stop and remove everything
make shell-backend  # Open shell in backend container
make shell-frontend # Open shell in frontend container
make shell-db       # Open MongoDB shell
make ps             # Show running containers
make install        # Install npm dependencies
```

## Network Communication

### How Services Talk to Each Other

**Frontend → Backend:**
```
Frontend (localhost:5178) 
  ↓ (via docker network)
Backend service name (backend:5007)
```

Frontend uses: `http://localhost:5007/api` (from host)
Backend uses: `http://backend:5007/api` (from inside Docker network)

**Backend → MongoDB:**
```
Backend service name (backend)
  ↓ (via docker network)
MongoDB service name (mongodb:27017)
```

MongoDB URI: `mongodb://admin:password@mongodb:27017/db`

### DNS Resolution

Docker's embedded DNS server resolves service names:

```bash
# From backend container, resolve frontend
docker-compose exec backend nslookup frontend

# Should resolve to Docker network IP
```

## Next Steps

1. ✅ All services running and healthy?
2. 📝 Read API documentation in README.md
3. 🧪 Set up testing environment
4. 🚀 Deploy to production
5. 📊 Set up monitoring and logging

## Additional Resources

- Docker Documentation: https://docs.docker.com
- Docker Compose Reference: https://docs.docker.com/compose/compose-file/
- MongoDB Docker Hub: https://hub.docker.com/_/mongo
- Node.js Docker Hub: https://hub.docker.com/_/node
- Nginx Docker Hub: https://hub.docker.com/_/nginx

## Need Help?

- 📖 Check logs: `docker-compose logs -f`
- 📋 Check service status: `docker-compose ps`
- 🔍 Inspect container: `docker inspect container-name`
- 🌐 Check network: `docker network inspect gulmigang-network`
- 💻 Ask in GitHub Issues: https://github.com/Aakashpuri786/GulmiGang/issues

---

**Last updated:** 2024  
**GulmiGang Docker Documentation**
