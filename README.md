<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SecuRFP Analyzer

AI-powered RFP (Request for Proposal) requirement analyzer for security vendors.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Quick Start

**Prerequisites:** 
- Node.js 18 or higher
- Ollama installed and running (see [OLLAMA_SETUP.md](OLLAMA_SETUP.md))

1. **Install Ollama** (if not already installed):
   ```bash
   # Linux/macOS
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Or download from https://ollama.com/download
   ```

2. **Start Ollama and install a model:**
   ```bash
   # Start Ollama service
   ollama serve
   
   # In another terminal, install a model (recommended: llama3.2:3b)
   ollama pull llama3.2:3b
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure Ollama** (optional - defaults work for local setup):
   ```bash
   # Create .env.local with Ollama settings
   echo "VITE_OLLAMA_BASE_URL=http://localhost:11434" > .env.local
   echo "VITE_OLLAMA_MODEL=llama3.2:3b" >> .env.local
   ```

5. **Run the app:**
   ```bash
   npm run dev
   ```

6. **Open your browser at `http://localhost:3000`**

## Platform-Specific Installation

### Linux Installation

For detailed Linux installation instructions, see [INSTALL_LINUX.md](INSTALL_LINUX.md).

**Quick Linux Setup:**
```bash
# Make setup script executable
chmod +x setup-linux.sh

# Run automated setup
./setup-linux.sh
```

The setup script will:
- Check Node.js installation
- Install dependencies
- Configure environment variables
- Verify port availability

### Docker Installation (Linux/Any Platform)

**Note:** For Docker deployment, you'll need to run Ollama separately or use Docker Compose with both services.

**Using Docker Compose:**
```bash
# Configure Ollama settings
echo "VITE_OLLAMA_BASE_URL=http://ollama:11434" > .env.local
echo "VITE_OLLAMA_MODEL=llama3.2:3b" >> .env.local

# Build and run (requires docker-compose.yml with Ollama service)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Using Docker directly:**
```bash
# Build image
docker build -t securfp-analyzer .

# Run container (Ollama must be accessible)
docker run -d \
  -p 3000:3000 \
  -e VITE_OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  -e VITE_OLLAMA_MODEL=llama3.2:3b \
  --name securfp-analyzer \
  securfp-analyzer
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Configuration

The application uses **Ollama** for local AI processing. No API keys needed!

**Ollama Configuration:**

Create a `.env.local` file in the project root (optional - defaults work for local setup):
```
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2:3b
```

**See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed setup instructions.**

## Network Access

The server is configured to listen on `0.0.0.0:3000`, making it accessible from:
- Localhost: `http://localhost:3000`
- Local network: `http://<your-ip-address>:3000`

## Troubleshooting

- **Ollama Setup:** See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for Ollama installation and configuration
- **Linux Installation:** See [INSTALL_LINUX.md](INSTALL_LINUX.md) for Linux-specific troubleshooting
- **Quick Start:** See [LINUX_QUICK_START.md](LINUX_QUICK_START.md) for quick reference

## AI Model Options

This application uses **Ollama** for local AI processing. You can use any Ollama-compatible model:

- **Recommended:** `llama3.2:3b` (good balance of quality and speed)
- **Better Quality:** `llama3.1:8b` or `mistral:7b` (requires more RAM)
- **Faster/Lighter:** `tinyllama:1.1b` or `phi3:mini` (lower resource usage)

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for model recommendations and installation.
