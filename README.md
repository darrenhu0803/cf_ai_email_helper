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

2. **Setup credentials**
   ```bash
   # Copy the template to the worker directory
   cp .env.example email-helper-worker/.dev.vars
   
   # Edit email-helper-worker/.dev.vars and add your Gmail OAuth credentials
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

Before running the app, you need to configure Gmail OAuth credentials:

#### Step 1: Create Google OAuth Credentials (5 minutes)

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
   - Create a new project or select existing one
   - Name it "AI Email Helper"

2. **Enable Gmail API**
   - Search for "Gmail API" in the console
   - Click "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: **External**
   - App name: **AI Email Helper**
   - Add your email as support and developer contact
   - **Scopes**: Add these Gmail scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - **Test users**: Add your Gmail address
   - Click "Save and Continue"

4. **Create OAuth Client ID**
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: **AI Email Helper**
   - Authorized redirect URIs:
     - Add: `http://localhost:8787/api/oauth/gmail/callback`
   - Click "Create"
   - **Copy the Client ID and Client Secret**

#### Step 2: Add Credentials Locally

1. **Copy the environment template to the worker directory**:
   ```bash
   cp .env.example email-helper-worker/.dev.vars
   ```

2. **Edit `email-helper-worker/.dev.vars`** and add your credentials:
   ```env
   GMAIL_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=GOCSPX-your-secret-here
   GMAIL_REDIRECT_URI=http://localhost:8787/api/oauth/gmail/callback
   ```

3. **Save the file** - `.dev.vars` is automatically ignored by Git (never commit it!)

#### Step 3: Connect Your Gmail

1. Start the app: `npm run dev`
2. Open http://localhost:5173
3. Login/Register an account
4. Click your profile → **Settings**
5. Click **"Connect Gmail"**
6. Authorize the app in Google OAuth flow
7. Click **"Sync Now"** to import your emails

✅ **Done!** Your emails will now sync with AI summaries and classifications.

---

### Deployment

```bash
# Deploy to Cloudflare
npm run deploy

# Or deploy individually:
npm run deploy:worker
npm run deploy:ui
```

**For production**: Use Cloudflare Secrets instead of environment variables:
```bash
npx wrangler secret put GMAIL_CLIENT_SECRET
# Prompted to enter the secret value
```

---

## Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Powered by [Workers AI](https://developers.cloudflare.com/workers-ai/)
- Inspired by the [Cloudflare Agents](https://developers.cloudflare.com/agents/) documentation

