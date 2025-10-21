# AI Email Helper

> An intelligent email assistant built on Cloudflare's edge platform that automatically summarizes, classifies, and helps you manage emails through natural conversation.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Overview

AI Email Helper leverages Cloudflare's serverless platform to provide intelligent email management without traditional servers. Built with Workers AI, Durable Objects, and Workflows, it processes emails at the edge for instant summaries, smart filtering, and conversational interaction.

### Key Features

- ** AI-Powered Summarization** - Automatic email summaries using Llama 3.1
- ** Smart Classification** - Intelligent categorization (important/spam/newsletter)
- ** Chat Interface** - Natural language queries and email management
- ** Real-time Updates** - WebSocket notifications for instant email alerts
- ** Automatic Filtering** - ML-based spam and unwanted email detection
- ** Secure & Private** - Data stored in isolated Durable Objects


---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Cloudflare Workers |
| **AI/LLM** | Workers AI (Llama 3.1 8B Instruct) |
| **State** | Durable Objects |
| **Orchestration** | Cloudflare Workflows |
| **Email** | Cloudflare Email Routing |
| **Deployment** | Cloudflare Pages + Workers |


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

2. **Setup credentials safely**
   ```bash
   # Copy the template
   cp .env.example .env.local
   
   # Edit .env.local and add your Gmail OAuth credentials
   # See GMAIL_SETUP_GUIDE.md for how to get credentials
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development servers**
   ```bash
   # Start both worker and UI simultaneously
   npm run dev
   
   # Or start individually:
   npm run dev:worker   # Backend at http://localhost:8787
   npm run dev:ui       # Frontend at http://localhost:5173
   ```

### Configuration

Before running the app, you need to set up your Gmail OAuth credentials:

1. **Read the security guide** - See [SETUP_SECURITY.md](./SETUP_SECURITY.md) for safe credential handling
2. **Follow the setup guide** - See [GMAIL_SETUP_GUIDE.md](./GMAIL_SETUP_GUIDE.md) for detailed OAuth setup (5 minutes)
3. **Add your credentials** - Copy `.env.example` to `.env.local` and fill in your credentials

**Never commit `.env.local` to Git!** It's automatically ignored by `.gitignore`.

### Deployment

```bash
# Deploy to Cloudflare
npm run deploy

# Or deploy individually:
npm run deploy:worker
npm run deploy:ui
```


## Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Powered by [Workers AI](https://developers.cloudflare.com/workers-ai/)
- Inspired by the [Cloudflare Agents](https://developers.cloudflare.com/agents/) documentation

