# AI Email Helper

> An intelligent email assistant built on Cloudflare's edge platform that automatically summarizes, classifies, and helps you manage emails through natural conversation.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Overview

AI Email Helper leverages Cloudflare's serverless platform to provide intelligent email management without traditional servers. Built with Workers AI, Durable Objects, and Workflows, it processes emails at the edge for instant summaries, smart filtering, and conversational interaction.

### Key Features

- **🤖 AI-Powered Summarization** - Automatic email summaries using Llama 3.1
- **🔍 Smart Classification** - Intelligent categorization (important/spam/newsletter)
- **💬 Chat Interface** - Natural language queries and email management
- **⚡ Real-time Updates** - WebSocket notifications for instant email alerts
- **🚫 Automatic Filtering** - ML-based spam and unwanted email detection
- **🔐 Secure & Private** - Data stored in isolated Durable Objects

---

## Architecture

Built entirely on Cloudflare's edge network:

```
┌─────────────────────────────────────────┐
│           User Interface                │
│  (Cloudflare Pages + React)            │
└───────────┬─────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│      Cloudflare Workers (API)           │
│   • Email Routing Handler               │
│   • Chat API                            │
│   • WebSocket Server                    │
└───────────┬─────────────────────────────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌──────────┐    ┌──────────────┐
│Workers AI│    │    Durable   │
│ (Llama)  │    │    Objects   │
│          │    │ • User State │
│          │    │ • Chat Sess. │
└──────────┘    └──────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Cloudflare Workers (TypeScript) |
| **AI/LLM** | Workers AI (Llama 3.1 8B Instruct) |
| **State** | Durable Objects |
| **Orchestration** | Cloudflare Workflows |
| **Email** | Cloudflare Email Routing |
| **Deployment** | Cloudflare Pages + Workers |

---

## Project Structure

```
cf-ai-email-helper/
├── email-helper-worker/          # Cloudflare Worker (Backend)
│   ├── src/
│   │   ├── index.js             # Main worker entry
│   │   ├── durable-objects/     # State management
│   │   ├── workflows/           # Email processing pipeline
│   │   └── services/            # LLM, email handlers
│   └── wrangler.jsonc
│
└── email-helper-ui/              # Cloudflare Pages (Frontend)
    ├── src/
    │   ├── components/          # React components
    │   ├── hooks/               # Custom hooks
    │   └── api/                 # API client
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Cloudflare account (free tier works)
- Domain name (for email routing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cf-ai-email-helper.git
   cd cf-ai-email-helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   # Start both worker and UI simultaneously
   npm run dev
   
   # Or start individually:
   npm run dev:worker   # Backend at http://localhost:8787
   npm run dev:ui       # Frontend at http://localhost:5173
   ```

### Deployment

```bash
# Deploy to Cloudflare
npm run deploy

# Or deploy individually:
npm run deploy:worker
npm run deploy:ui
```

---

## Configuration

### Worker Setup

Configure email routing in `email-helper-worker/wrangler.jsonc`:

```jsonc
{
  "email": [
    {
      "type": "route",
      "pattern": "*@yourdomain.com",
      "destination": "worker"
    }
  ]
}
```

### Environment Variables

Set up secrets for the worker:

```bash
cd email-helper-worker
npx wrangler secret put JWT_SECRET
```

---

## Usage

### Chat Commands

- **"Show me important emails from today"** - Filter emails by importance
- **"What did John say about the project?"** - Search email content
- **"Mark newsletters as low priority"** - Create custom filters
- **"Summarize my unread emails"** - Get bulk summaries

### Email Processing

Emails are automatically:
1. Received via Cloudflare Email Routing
2. Classified by importance (important/spam/newsletter)
3. Summarized using AI
4. Stored in Durable Objects
5. Available via chat interface

---

## Development

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both worker and UI |
| `npm run dev:worker` | Start worker only |
| `npm run dev:ui` | Start UI only |
| `npm run build` | Build both projects |
| `npm run deploy` | Deploy to Cloudflare |

### Testing

```bash
# Test email summarization
curl -X POST http://localhost:8787/test/summarize \
  -H "Content-Type: application/json" \
  -d '{"emailContent": "Your email text here..."}'
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Powered by [Workers AI](https://developers.cloudflare.com/workers-ai/)
- Inspired by the [Cloudflare Agents](https://developers.cloudflare.com/agents/) documentation

---

## Resources

- [📖 Documentation](https://developers.cloudflare.com)
- [💬 Community](https://community.cloudflare.com)
- [🐛 Report Bug](https://github.com/yourusername/cf-ai-email-helper/issues)
- [✨ Request Feature](https://github.com/yourusername/cf-ai-email-helper/issues)

---

*Built with ❤️ using Cloudflare's edge platform*

