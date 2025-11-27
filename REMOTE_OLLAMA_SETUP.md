# Remote Ollama Setup

This guide explains how to configure the application to use Ollama running on a remote server.

## Configuration

### Step 1: Create/Update .env.local

On the Linux machine where the application runs, create or update `.env.local`:

```bash
cd /path/to/securfp-analyzer

cat > .env.local << EOF
VITE_OLLAMA_BASE_URL=http://172.16.0.4:11434
VITE_OLLAMA_MODEL=llama3.2:3b
EOF
```

**Important:** Replace `llama3.2:3b` with the actual model name installed on the Ollama server.

### Step 2: Verify Ollama Server is Accessible

From the application machine, test the connection:

```bash
# Test if Ollama server is reachable
curl http://172.16.0.4:11434/api/tags

# Should return JSON with available models
```

### Step 3: Start the Application

```bash
npm run dev
```

## Troubleshooting

### Connection Refused

If you get connection errors:

1. **Check firewall on Ollama server (172.16.0.4):**
   ```bash
   # On the Ollama server, check if port 11434 is open
   sudo netstat -tuln | grep 11434
   
   # If using firewalld (CentOS/RHEL/Fedora):
   sudo firewall-cmd --permanent --add-port=11434/tcp
   sudo firewall-cmd --reload
   
   # If using UFW (Ubuntu/Debian):
   sudo ufw allow 11434/tcp
   ```

2. **Verify Ollama is listening on the correct interface:**
   ```bash
   # On Ollama server, check if it's listening on all interfaces
   # Ollama should be started with:
   export OLLAMA_HOST=0.0.0.0:11434
   ollama serve
   ```

### CORS Issues

If you encounter CORS errors, configure Ollama to allow your application's origin:

```bash
# On Ollama server (172.16.0.4)
export OLLAMA_ORIGINS="http://your-app-ip:3000,http://localhost:3000"
ollama serve
```

### Model Not Found

If the model isn't available on the remote server:

```bash
# On Ollama server (172.16.0.4), list available models:
ollama list

# Pull the required model if needed:
ollama pull llama3.2:3b
```

## Network Configuration

### Option 1: Direct IP (Current Setup)
```
VITE_OLLAMA_BASE_URL=http://172.16.0.4:11434
```

### Option 2: Using Hostname (if DNS configured)
```
VITE_OLLAMA_BASE_URL=http://ollama-server.local:11434
```

### Option 3: Using HTTPS (if SSL configured)
```
VITE_OLLAMA_BASE_URL=https://172.16.0.4:11434
```

## Security Considerations

1. **Network Security:** Ensure the network between machines is secure (VPN, private network, etc.)
2. **Firewall Rules:** Only allow connections from trusted IPs
3. **HTTPS:** Consider using a reverse proxy with SSL/TLS for production

## Testing the Connection

Before starting the application, verify everything works:

```bash
# 1. Test Ollama connection
curl http://172.16.0.4:11434/api/tags

# 2. Test model availability
curl http://172.16.0.4:11434/api/show -d '{"name":"llama3.2:3b"}'

# 3. Test generation (optional)
curl http://172.16.0.4:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Hello",
  "stream": false
}'
```

If all tests pass, your application should work correctly!

