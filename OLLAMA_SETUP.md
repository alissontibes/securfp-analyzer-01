# Ollama Setup Guide

This application now uses **Ollama** for local AI model execution instead of Gemini. This provides better privacy, no API costs, and works completely offline.

## Prerequisites

### 1. Install Ollama

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**macOS:**
```bash
# Using Homebrew
brew install ollama

# Or download from https://ollama.com/download
```

**Windows:**
Download and install from https://ollama.com/download

### 2. Start Ollama Service

Ollama runs as a local service. Start it:

```bash
# Start Ollama (usually runs automatically after installation)
ollama serve

# Or run in background
ollama serve &
```

The service will be available at `http://localhost:11434` by default.

### 3. Install a Language Model

You need to download at least one model. Recommended models for this application:

**For better accuracy (requires more RAM):**
```bash
# Llama 3.2 3B (recommended - good balance)
ollama pull llama3.2:3b

# Llama 3.1 8B (better quality, needs ~8GB RAM)
ollama pull llama3.1:8b

# Mistral 7B (excellent quality, needs ~7GB RAM)
ollama pull mistral:7b
```

**For lower resource usage:**
```bash
# TinyLlama 1.1B (minimal resources, ~1GB RAM)
ollama pull tinyllama:1.1b

# Phi-3 Mini (good quality, ~2GB RAM)
ollama pull phi3:mini
```

**Check installed models:**
```bash
ollama list
```

## Configuration

### Environment Variables

Create or update your `.env.local` file:

```bash
# Ollama base URL (default: http://localhost:11434)
VITE_OLLAMA_BASE_URL=http://localhost:11434

# Ollama model to use (default: llama3.2:3b)
VITE_OLLAMA_MODEL=llama3.2:3b
```

**Example `.env.local`:**
```
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2:3b
```

### Using a Different Model

To use a different model, update `VITE_OLLAMA_MODEL` in `.env.local`:

```bash
# For example, to use Mistral:
VITE_OLLAMA_MODEL=mistral:7b
```

## Running the Application

1. **Ensure Ollama is running:**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   
   # If not running, start it:
   ollama serve
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open `http://localhost:3000` in your browser.

## Troubleshooting

### Ollama Connection Error

**Error:** "Ollama não está disponível"

**Solution:**
1. Check if Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. If not running, start Ollama:
   ```bash
   ollama serve
   ```

3. If Ollama is running on a different port or host, update `.env.local`:
   ```
   VITE_OLLAMA_BASE_URL=http://your-host:your-port
   ```

### Model Not Found

**Error:** Model not available

**Solution:**
1. Check installed models:
   ```bash
   ollama list
   ```

2. Pull the required model:
   ```bash
   ollama pull llama3.2:3b
   ```

3. Update `.env.local` with the correct model name.

### Slow Response Times

**Issue:** Responses are slow

**Solutions:**
1. Use a smaller/faster model (e.g., `tinyllama:1.1b`)
2. Ensure you have enough RAM (models need RAM to run)
3. Close other applications to free up resources
4. Consider using a GPU if available (Ollama supports GPU acceleration)

### CORS Issues (if accessing from different host)

If accessing the application from a different machine, you may need to configure Ollama CORS:

```bash
# Set environment variable before starting Ollama
export OLLAMA_ORIGINS="*"
ollama serve
```

Or add to your systemd service or startup script.

## Remote Ollama Server

If you want to run Ollama on a different machine:

1. **On the Ollama server**, allow remote connections:
   ```bash
   export OLLAMA_HOST=0.0.0.0:11434
   ollama serve
   ```

2. **In your application**, update `.env.local`:
   ```
   VITE_OLLAMA_BASE_URL=http://your-ollama-server-ip:11434
   ```

3. **Security Note:** Only do this on trusted networks or use proper authentication.

## Model Recommendations

| Model | Size | RAM Needed | Quality | Speed |
|-------|------|------------|---------|-------|
| `tinyllama:1.1b` | 1.1B | ~1GB | Basic | Very Fast |
| `phi3:mini` | 3.8B | ~2GB | Good | Fast |
| `llama3.2:3b` | 3B | ~3GB | Good | Fast |
| `llama3.1:8b` | 8B | ~8GB | Excellent | Medium |
| `mistral:7b` | 7B | ~7GB | Excellent | Medium |
| `llama3.1:70b` | 70B | ~70GB | Best | Slow |

For this RFP analyzer application, **llama3.2:3b** or **llama3.1:8b** are recommended for the best balance of quality and performance.

## Performance Tips

1. **Use GPU acceleration** (if available):
   - Ollama automatically uses GPU if available
   - Check GPU usage: `nvidia-smi` (for NVIDIA GPUs)

2. **Monitor resource usage:**
   ```bash
   # Check Ollama process
   ps aux | grep ollama
   
   # Check model memory usage
   ollama ps
   ```

3. **Adjust model based on your hardware:**
   - Low-end: Use `tinyllama:1.1b` or `phi3:mini`
   - Mid-range: Use `llama3.2:3b`
   - High-end: Use `llama3.1:8b` or `mistral:7b`

## Next Steps

1. Install Ollama
2. Pull a model: `ollama pull llama3.2:3b`
3. Configure `.env.local` with your model choice
4. Start the application: `npm run dev`

For more information about Ollama, visit: https://ollama.com

