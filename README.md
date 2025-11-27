<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SecuRFP Analyzer

AI-powered RFP (Request for Proposal) requirement analyzer for security vendors.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Quick Start

**Prerequisites:** Node.js 18 or higher

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key:
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`

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

**Using Docker Compose:**
```bash
# Set your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Build and run
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

# Run container
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key_here \
  --name securfp-analyzer \
  securfp-analyzer
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Configuration

The application requires a Gemini API key. Get one from [Google AI Studio](https://aistudiocdn.com/apikey).

Create a `.env.local` file in the project root:
```
GEMINI_API_KEY=your_api_key_here
```

## Network Access

The server is configured to listen on `0.0.0.0:3000`, making it accessible from:
- Localhost: `http://localhost:3000`
- Local network: `http://<your-ip-address>:3000`

## Troubleshooting

See [INSTALL_LINUX.md](INSTALL_LINUX.md) for Linux-specific troubleshooting, or check the main documentation for your platform.
