# Linux Installation Guide

This guide will help you install and run the SecuRFP Analyzer on a Linux system.

## Prerequisites

### 1. Node.js and npm

You need Node.js version 18 or higher. Check if you have it installed:

```bash
node --version
npm --version
```

#### Installation Options:

**Option A: Using Node Version Manager (nvm) - Recommended**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your shell configuration
source ~/.bashrc  # or ~/.zshrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

**Option B: Using Package Manager**

**Ubuntu/Debian:**
```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install -y nodejs npm

# Verify installation
node --version
npm --version
```

**CentOS/RHEL/Fedora:**
```bash
# Install Node.js and npm
sudo dnf install -y nodejs npm
# or for older versions: sudo yum install -y nodejs npm

# Verify installation
node --version
npm --version
```

**Arch Linux:**
```bash
sudo pacman -S nodejs npm
```

**Option C: Using NodeSource Repository (Latest LTS)**

```bash
# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# For CentOS/RHEL/Fedora
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

### 2. Git (if cloning from repository)

```bash
# Ubuntu/Debian
sudo apt install -y git

# CentOS/RHEL/Fedora
sudo dnf install -y git
# or: sudo yum install -y git

# Arch Linux
sudo pacman -S git
```

## Installation Steps

### 1. Clone or Extract the Project

If you have the project files, navigate to the project directory:

```bash
cd /path/to/securfp-analyzer
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19.2.0
- Vite 6.2.0
- TypeScript 5.8.2
- Google GenAI SDK
- And other dependencies

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
nano .env.local
```

Add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

Save and exit (Ctrl+X, then Y, then Enter in nano).

**Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Build and Run

**Development Mode:**
```bash
npm run dev
```

The server will start on `http://localhost:3000` and will be accessible from your local network at `http://<your-ip>:3000`.

**Production Build:**
```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Running as a Service (Systemd)

To run the application as a background service that starts on boot:

### 1. Create a systemd service file

```bash
sudo nano /etc/systemd/system/securfp-analyzer.service
```

### 2. Add the following content (adjust paths as needed):

```ini
[Unit]
Description=SecuRFP Analyzer Web Application
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/securfp-analyzer
Environment="NODE_ENV=production"
Environment="GEMINI_API_KEY=your_api_key_here"
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Important:** Replace:
- `your-username` with your Linux username
- `/path/to/securfp-analyzer` with the actual path to your project
- `your_api_key_here` with your actual API key
- `/usr/bin/npm` with the path to npm (find it with `which npm`)

### 3. Enable and start the service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable securfp-analyzer

# Start the service
sudo systemctl start securfp-analyzer

# Check status
sudo systemctl status securfp-analyzer

# View logs
sudo journalctl -u securfp-analyzer -f
```

## Using the Setup Script

For automated setup, use the provided script:

```bash
chmod +x setup-linux.sh
./setup-linux.sh
```

This script will:
1. Check for Node.js installation
2. Install dependencies
3. Help you configure the API key
4. Start the development server

## Docker Installation (Alternative)

See `Dockerfile` and `docker-compose.yml` for containerized deployment.

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is already in use:

```bash
# Find the process using port 3000
sudo lsof -i :3000

# Kill the process (replace PID with actual process ID)
sudo kill -9 <PID>
```

Or change the port in `vite.config.ts`:

```typescript
server: {
  port: 3001,  // Change to another port
  host: '0.0.0.0',
}
```

### Permission Denied Errors

If you encounter permission errors:

```bash
# Fix npm permissions (if needed)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /path/to/securfp-analyzer
```

### Build Errors

If you encounter build errors related to `pdfjs-dist`:

The project is already configured with ES2022 target. If issues persist:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Firewall Configuration

If you can't access the application from other machines:

**Ubuntu/Debian (UFW):**
```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

**CentOS/RHEL/Fedora (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## Network Access

The server is configured to listen on `0.0.0.0`, making it accessible from:
- Localhost: `http://localhost:3000`
- Local network: `http://<your-ip-address>:3000`

To find your IP address:
```bash
# Most Linux distributions
ip addr show
# or
hostname -I
```

## Security Considerations

1. **API Key Security**: Never expose your `.env.local` file or commit it to version control
2. **Firewall**: Consider restricting access to port 3000 if running in production
3. **HTTPS**: For production, use a reverse proxy (nginx, Apache) with SSL/TLS
4. **User Permissions**: Run the service with a non-root user

## Next Steps

- Access the application at `http://localhost:3000`
- Configure your vendor preferences
- Start analyzing RFP requirements

For more information, see the main [README.md](README.md).

