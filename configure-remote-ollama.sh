#!/bin/bash

# Quick configuration script for remote Ollama setup

OLLAMA_SERVER="172.16.0.4"
OLLAMA_PORT="11434"

echo "Configuring application for remote Ollama at ${OLLAMA_SERVER}:${OLLAMA_PORT}"

# Test connection
echo "Testing connection to Ollama server..."
MODELS=$(curl -s http://${OLLAMA_SERVER}:${OLLAMA_PORT}/api/tags 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✓ Connection successful!"
    echo ""
    echo "Available models on the server:"
    echo "$MODELS" | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"//' | sed 's/^/  - /'
    echo ""
    
    # Try to detect the 120b model
    MODEL_NAME=$(echo "$MODELS" | grep -o '"name":"[^"]*120b[^"]*"' | head -1 | sed 's/"name":"//;s/"//')
    
    if [ -z "$MODEL_NAME" ]; then
        # Try alternative patterns
        MODEL_NAME=$(echo "$MODELS" | grep -o '"name":"[^"]*120[^"]*"' | head -1 | sed 's/"name":"//;s/"//')
    fi
    
    if [ -z "$MODEL_NAME" ]; then
        echo "Could not auto-detect 120b model. Please enter the exact model name:"
        read -p "Model name: " MODEL_NAME
    else
        echo "Detected model: $MODEL_NAME"
        read -p "Use this model? (Y/n): " CONFIRM
        if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
            read -p "Enter model name: " MODEL_NAME
        fi
    fi
else
    echo "✗ Cannot connect to Ollama server at ${OLLAMA_SERVER}:${OLLAMA_PORT}"
    echo "Please check:"
    echo "  1. Ollama is running on the server"
    echo "  2. Firewall allows port ${OLLAMA_PORT}"
    echo "  3. Ollama is configured to listen on 0.0.0.0 (not just localhost)"
    echo ""
    read -p "Enter model name manually: " MODEL_NAME
fi

# Create .env.local
cat > .env.local << EOF
VITE_OLLAMA_BASE_URL=http://${OLLAMA_SERVER}:${OLLAMA_PORT}
VITE_OLLAMA_MODEL=${MODEL_NAME}
EOF

echo ""
echo "✓ Configuration saved to .env.local"
echo ""
echo "Configuration:"
echo "  Ollama Server: http://${OLLAMA_SERVER}:${OLLAMA_PORT}"
echo "  Model: ${MODEL_NAME}"
echo ""
echo "You can now start the application with: npm run dev"

