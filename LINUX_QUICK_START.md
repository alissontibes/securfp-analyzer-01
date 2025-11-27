# Linux Quick Start Guide

## Fastest Installation Method

### Option 1: Automated Setup Script (Recommended)

```bash
# 1. Make script executable
chmod +x setup-linux.sh

# 2. Run setup
./setup-linux.sh

# 3. Start the server
npm run dev
```

### Option 2: Manual Installation

```bash
# 1. Install Node.js (if not installed)
# Ubuntu/Debian:
sudo apt update && sudo apt install -y nodejs npm

# CentOS/RHEL/Fedora:
sudo dnf install -y nodejs npm

# 2. Install dependencies
npm install

# 3. Create .env.local file
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. Start the server
npm run dev
```

### Option 3: Docker (No Node.js Required)

```bash
# 1. Install Docker (if not installed)
# Ubuntu/Debian:
sudo apt update && sudo apt install -y docker.io docker-compose

# CentOS/RHEL/Fedora:
sudo dnf install -y docker docker-compose

# 2. Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# 3. Set API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. Build and run
docker-compose up -d

# 5. Check status
docker-compose ps
```

## Access the Application

Once running, access at:
- **Local:** http://localhost:3000
- **Network:** http://<your-ip>:3000

Find your IP:
```bash
hostname -I
# or
ip addr show | grep "inet "
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Docker
docker-compose up -d     # Start in background
docker-compose logs -f   # View logs
docker-compose down      # Stop
docker-compose restart   # Restart

# Service management (if using systemd)
sudo systemctl start securfp-analyzer
sudo systemctl stop securfp-analyzer
sudo systemctl status securfp-analyzer
sudo journalctl -u securfp-analyzer -f
```

## Troubleshooting

**Port 3000 in use:**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

**Permission errors:**
```bash
sudo chown -R $USER:$USER .
```

**Firewall blocking access:**
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 3000/tcp

# CentOS/RHEL/Fedora (firewalld)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## Next Steps

For detailed information, see:
- [INSTALL_LINUX.md](INSTALL_LINUX.md) - Complete Linux installation guide
- [README.md](README.md) - General project documentation

