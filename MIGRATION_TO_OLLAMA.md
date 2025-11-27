# Migration to Ollama - Summary

The application has been successfully migrated from Google Gemini to **Ollama** for local AI processing.

## What Changed

### Code Changes

1. **New Service:** `services/ollamaService.ts` - Replaces `services/geminiService.ts`
   - Uses Ollama's HTTP API instead of Gemini SDK
   - No API key required (runs locally)
   - Configurable model selection

2. **Updated Files:**
   - `App.tsx` - Now imports from `ollamaService` instead of `geminiService`
   - `vite.config.ts` - Removed Gemini API key configuration
   - `package.json` - Removed `@google/genai` dependency

3. **Configuration:**
   - Environment variables changed from `GEMINI_API_KEY` to:
     - `VITE_OLLAMA_BASE_URL` (default: `http://localhost:11434`)
     - `VITE_OLLAMA_MODEL` (default: `llama3.2:3b`)

### Documentation Added

- **OLLAMA_SETUP.md** - Complete Ollama installation and configuration guide
- **OLLAMA_WORKFLOW.md** - Step-by-step workflow guide
- **README.md** - Updated with Ollama instructions
- **setup-linux.sh** - Updated to configure Ollama instead of Gemini

## Quick Start with Ollama

1. **Install Ollama:**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Start Ollama and install a model:**
   ```bash
   ollama serve
   ollama pull llama3.2:3b
   ```

3. **Configure (optional - defaults work):**
   ```bash
   echo "VITE_OLLAMA_BASE_URL=http://localhost:11434" > .env.local
   echo "VITE_OLLAMA_MODEL=llama3.2:3b" >> .env.local
   ```

4. **Run the application:**
   ```bash
   npm install
   npm run dev
   ```

## Benefits of Ollama

✅ **No API costs** - Runs completely locally  
✅ **Better privacy** - Data never leaves your machine  
✅ **Offline capable** - Works without internet  
✅ **Model flexibility** - Choose from many open-source models  
✅ **No API keys** - No authentication needed  

## Model Recommendations

- **Recommended:** `llama3.2:3b` - Good balance of quality and speed
- **Better Quality:** `llama3.1:8b` or `mistral:7b` - Needs more RAM
- **Faster/Lighter:** `tinyllama:1.1b` or `phi3:mini` - Lower resources

## Important Notes

1. **Ollama must be running** before starting the application
2. **Model must be installed** - Use `ollama pull <model-name>`
3. **No Google Search** - Ollama doesn't have web search capabilities like Gemini
4. **Local processing** - All AI processing happens on your machine

## Troubleshooting

If you see "Ollama não está disponível":
1. Check if Ollama is running: `curl http://localhost:11434/api/tags`
2. Start Ollama: `ollama serve`
3. Verify model is installed: `ollama list`

For more details, see [OLLAMA_SETUP.md](OLLAMA_SETUP.md) and [OLLAMA_WORKFLOW.md](OLLAMA_WORKFLOW.md).

