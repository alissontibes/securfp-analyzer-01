# Ollama Workflow Guide

This guide explains how to set up and use the SecuRFP Analyzer with Ollama.

## Complete Setup Workflow

### Step 1: Install Ollama

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**macOS:**
```bash
brew install ollama
# Or download from https://ollama.com/download
```

**Windows:**
Download from https://ollama.com/download

### Step 2: Start Ollama Service

```bash
# Start Ollama (runs in background by default)
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

### Step 3: Install a Model

```bash
# Recommended model (good balance)
ollama pull llama3.2:3b

# Or for better quality (needs more RAM)
ollama pull llama3.1:8b

# Or for lower resources
ollama pull phi3:mini
```

### Step 4: Configure the Application

```bash
# Create .env.local (optional - defaults work for local setup)
cat > .env.local << EOF
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2:3b
EOF
```

### Step 5: Install Application Dependencies

```bash
npm install
```

### Step 6: Start the Application

```bash
npm run dev
```

### Step 7: Access the Application

Open `http://localhost:3000` in your browser.

## Daily Workflow

### Starting the Application

1. **Ensure Ollama is running:**
   ```bash
   # Check if running
   curl http://localhost:11434/api/tags
   
   # If not, start it
   ollama serve
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Use the application** at `http://localhost:3000`

### Stopping the Application

1. Stop the dev server: `Ctrl+C` in the terminal
2. (Optional) Stop Ollama if not needed: `pkill ollama`

## Switching Models

To use a different model:

1. **Pull the new model:**
   ```bash
   ollama pull mistral:7b
   ```

2. **Update `.env.local`:**
   ```
   VITE_OLLAMA_MODEL=mistral:7b
   ```

3. **Restart the application:**
   ```bash
   npm run dev
   ```

## Troubleshooting Workflow

### Problem: "Ollama não está disponível"

**Check:**
```bash
# 1. Is Ollama running?
curl http://localhost:11434/api/tags

# 2. If not, start it
ollama serve

# 3. Check if it's on a different port
ps aux | grep ollama
```

### Problem: Model not found

**Check:**
```bash
# 1. List installed models
ollama list

# 2. Pull the required model
ollama pull llama3.2:3b

# 3. Verify model name in .env.local
cat .env.local
```

### Problem: Slow responses

**Solutions:**
1. Use a smaller model: `ollama pull tinyllama:1.1b`
2. Check system resources: `htop` or `top`
3. Close other applications
4. Consider GPU acceleration (if available)

## Remote Ollama Setup

If you want to run Ollama on a different machine:

### On the Ollama Server:

```bash
# Allow remote connections
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

### On the Application Machine:

```bash
# Update .env.local
echo "VITE_OLLAMA_BASE_URL=http://your-ollama-server-ip:11434" > .env.local
```

## Production Workflow

For production deployment:

1. **Run Ollama as a service:**
   ```bash
   # Create systemd service (Linux)
   sudo nano /etc/systemd/system/ollama.service
   ```

2. **Configure the service:**
   ```ini
   [Unit]
   Description=Ollama Service
   After=network.target

   [Service]
   ExecStart=/usr/local/bin/ollama serve
   User=your-user
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and start:**
   ```bash
   sudo systemctl enable ollama
   sudo systemctl start ollama
   ```

4. **Deploy the application** (see Docker or other deployment methods)

## Quick Reference

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# List models
ollama list

# Pull a model
ollama pull llama3.2:3b

# Run a test query
ollama run llama3.2:3b "Hello, how are you?"

# Check running models
ollama ps

# Stop a model
ollama stop llama3.2:3b
```

## Model Selection Guide

Choose a model based on your hardware:

- **< 4GB RAM:** `tinyllama:1.1b` or `phi3:mini`
- **4-8GB RAM:** `llama3.2:3b`
- **8-16GB RAM:** `llama3.1:8b` or `mistral:7b`
- **16GB+ RAM:** `llama3.1:70b` (best quality)

For this RFP analyzer, **llama3.2:3b** is recommended for most use cases.

