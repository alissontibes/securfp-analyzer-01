<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SecuRFP Analyzer

AI-powered RFP (Request for Proposal) requirement analyzer for security vendors.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Quick Start

### Using Remote Ollama (Cloud Model)

If you have Ollama running on a remote server with cloud models:

```bash
# 1. Install dependencies
npm install

# 2. Configure for remote Ollama
echo "VITE_OLLAMA_BASE_URL=http://172.16.0.4:11434" > .env.local
echo "VITE_OLLAMA_MODEL=gpt-oss:120b-cloud" >> .env.local

# 3. Start the server
npm run dev
```

See [QUICK_START_REMOTE.md](QUICK_START_REMOTE.md) for detailed remote setup.

### Using Local Ollama

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
   # For local Ollama
   echo "VITE_OLLAMA_BASE_URL=http://localhost:11434" > .env.local
   echo "VITE_OLLAMA_MODEL=llama3.2:3b" >> .env.local
   
   # OR for remote Ollama (e.g., cloud model)
   echo "VITE_OLLAMA_BASE_URL=http://172.16.0.4:11434" > .env.local
   echo "VITE_OLLAMA_MODEL=gpt-oss:120b-cloud" >> .env.local
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

The application uses **Ollama** for AI processing. No API keys needed!

### Local Ollama Setup

Create a `.env.local` file in the project root (optional - defaults work for local setup):
```
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2:3b
```

### Remote Ollama Setup

If Ollama is running on a different machine:

```
VITE_OLLAMA_BASE_URL=http://172.16.0.4:11434
VITE_OLLAMA_MODEL=gpt-oss:120b-cloud
```

**Example:** To use a cloud model on a remote Ollama server:
```bash
echo "VITE_OLLAMA_BASE_URL=http://172.16.0.4:11434" > .env.local
echo "VITE_OLLAMA_MODEL=gpt-oss:120b-cloud" >> .env.local
```

**See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed setup instructions.**
**See [REMOTE_OLLAMA_SETUP.md](REMOTE_OLLAMA_SETUP.md) for remote Ollama configuration.**
**See [QUICK_START_REMOTE.md](QUICK_START_REMOTE.md) for quick remote setup guide.**

## Network Access

The server is configured to listen on `0.0.0.0:3000`, making it accessible from:
- Localhost: `http://localhost:3000`
- Local network: `http://<your-ip-address>:3000`

## Troubleshooting

- **Ollama Setup:** See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for Ollama installation and configuration
- **Remote Ollama:** See [REMOTE_OLLAMA_SETUP.md](REMOTE_OLLAMA_SETUP.md) for remote server configuration
- **Quick Remote Setup:** See [QUICK_START_REMOTE.md](QUICK_START_REMOTE.md) for quick remote setup
- **Linux Installation:** See [INSTALL_LINUX.md](INSTALL_LINUX.md) for Linux-specific troubleshooting
- **Quick Start:** See [LINUX_QUICK_START.md](LINUX_QUICK_START.md) for quick reference

### Common Issues

**Connection Error:** "Ollama não está disponível"
- Verify Ollama is running: `curl http://localhost:11434/api/tags` (or your remote URL)
- Check firewall settings if using remote Ollama
- Ensure Ollama is configured to listen on `0.0.0.0` (not just `localhost`) for remote access

**Model Not Found:**
- Check available models: `curl http://your-ollama-url:11434/api/tags`
- Update `.env.local` with the correct model name
- For cloud models, ensure internet connectivity on the Ollama server

## AI Model Options

This application uses **Ollama** for AI processing. You can use any Ollama-compatible model:

### Local Models (Run on your machine)

- **Recommended:** `llama3.2:3b` (good balance of quality and speed)
- **Better Quality:** `llama3.1:8b` or `mistral:7b` (requires more RAM)
- **Faster/Lighter:** `tinyllama:1.1b` or `phi3:mini` (lower resource usage)
- **Large Models:** `llama3.1:70b` or `llama3.1:120b` (requires significant RAM)

### Cloud Models (Hosted on Ollama Cloud)

- **Cloud Models:** `gpt-oss:120b-cloud` (116.8B parameters, requires internet connection)
- Cloud models are accessed through Ollama's cloud service
- No local storage required, but requires internet connectivity

### Finding Available Models

To see available models on your Ollama server:
```bash
# Local Ollama
curl http://localhost:11434/api/tags

# Remote Ollama
curl http://172.16.0.4:11434/api/tags
```

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for model recommendations and installation.
