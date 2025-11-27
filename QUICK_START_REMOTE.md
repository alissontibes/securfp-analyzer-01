# Quick Start - Remote Ollama (Cloud Model)

## Configuration for gpt-oss:120b-cloud

On your Linux machine where the application runs:

```bash
# Navigate to project directory
cd /home/alisson/securfp-analyzer-01

# Create .env.local with the cloud model
cat > .env.local << EOF
VITE_OLLAMA_BASE_URL=http://172.16.0.4:11434
VITE_OLLAMA_MODEL=gpt-oss:120b-cloud
EOF

# Install dependencies (if not done)
npm install

# Start the server
npm run dev
```

## Complete Command Sequence

```bash
cd /home/alisson/securfp-analyzer-01

# Configure for cloud model
echo "VITE_OLLAMA_BASE_URL=http://172.16.0.4:11434" > .env.local
echo "VITE_OLLAMA_MODEL=gpt-oss:120b-cloud" >> .env.local

# Install dependencies
npm install

# Start the webserver
npm run dev
```

The application will be available at `http://localhost:3000` and will use the `gpt-oss:120b-cloud` model from the remote Ollama server at `172.16.0.4:11434`.

