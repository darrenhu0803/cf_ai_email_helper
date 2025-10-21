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

To connect your Gmail account and start using the AI email features, you'll need to set up Google OAuth credentials. This is a one-time setup that takes about 5-10 minutes.

---

## 📧 Gmail OAuth Setup Guide

### Overview

This app uses **Google OAuth 2.0** to securely access your Gmail. You'll create OAuth credentials in Google Cloud Console, then configure them locally. Your credentials stay on your machine and are **never committed to Git**.

---

### Part 1: Google Cloud Console Setup

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top → **"New Project"**
3. Enter project name: `AI Email Helper`
4. Click **"Create"**
5. Wait a few seconds for the project to be created

> 📷 **[Screenshot: Creating a new Google Cloud project]**

---

#### Step 2: Enable Gmail API

1. In the Google Cloud Console, use the search bar at the top
2. Type: `Gmail API`
3. Click on **"Gmail API"** in the results
4. Click the **"Enable"** button
5. Wait for the API to be enabled

> 📷 **[Screenshot: Gmail API page with Enable button]**

---

#### Step 3: Configure OAuth Consent Screen

1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**

**OAuth consent screen - App information:**
- App name: `AI Email Helper`
- User support email: Select your email from dropdown
- Developer contact information: Enter your email

Click **"Save and Continue"**

> 📷 **[Screenshot: OAuth consent screen configuration]**

**Scopes:**
1. Click **"Add or Remove Scopes"**
2. Filter or search for: `gmail`
3. Select these two scopes:
   - ✅ `https://www.googleapis.com/auth/gmail.readonly` - View your email messages and settings
   - ✅ `https://www.googleapis.com/auth/gmail.modify` - Read, compose, and send emails from your account
4. Click **"Update"**
5. Click **"Save and Continue"**

> 📷 **[Screenshot: Selecting Gmail API scopes]**

**Test users:**
1. Click **"Add Users"**
2. Enter your Gmail address (the one you'll use to test the app)
3. Click **"Add"**
4. Click **"Save and Continue"**

> 📷 **[Screenshot: Adding test users]**

5. Review the summary and click **"Back to Dashboard"**

---

#### Step 4: Create OAuth 2.0 Client ID

1. In the left sidebar, go to **"Credentials"**
2. Click **"+ Create Credentials"** at the top
3. Select **"OAuth client ID"**

**Configure OAuth client:**
- Application type: **Web application**
- Name: `AI Email Helper`

**Authorized redirect URIs:**
1. Click **"+ Add URI"**
2. Enter exactly: `http://localhost:8787/api/oauth/gmail/callback`
3. ⚠️ **Important**: No trailing slash, exactly as shown above

> 📷 **[Screenshot: OAuth client ID configuration with redirect URI]**

4. Click **"Create"**

**Save your credentials:**
- A popup will appear with your **Client ID** and **Client Secret**
- ✅ **Copy both values** - you'll need them in the next step
- Click **"OK"**

> 📷 **[Screenshot: OAuth client created popup with credentials]**

💡 **Tip**: You can always view your credentials later by clicking on the OAuth client name in the Credentials page.

---

### Part 2: Local Configuration

#### Step 5: Add Credentials to Your App

1. **Open your terminal** in the project directory

2. **Copy the environment template**:
   ```bash
   cp .env.example email-helper-worker/.dev.vars
   ```

3. **Edit `email-helper-worker/.dev.vars`** with your favorite text editor:
```bash
   # Windows
   notepad email-helper-worker\.dev.vars
   
   # Mac/Linux
   nano email-helper-worker/.dev.vars
   ```

4. **Paste your credentials**:
   ```env
   GMAIL_CLIENT_ID=1036976009641-xxxxxxxxxxxxx.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
   GMAIL_REDIRECT_URI=http://localhost:8787/api/oauth/gmail/callback
   ```
   
   Replace the `xxx` values with your actual Client ID and Client Secret from Step 4.

5. **Save the file**

> 📷 **[Screenshot: .dev.vars file with credentials filled in]**

🔒 **Security Note**: The `.dev.vars` file is automatically ignored by Git (check `.gitignore`). Your credentials will never be committed to the repository.

---

### Part 3: Connect Your Gmail Account

#### Step 6: Start the Application

1. **Make sure both servers are running**:
   ```bash
   npm run dev
   ```
   
   This starts:
   - Backend (Worker) at `http://localhost:8787`
   - Frontend (UI) at `http://localhost:5173`

2. **Open your browser** and go to: `http://localhost:5173`

> 📷 **[Screenshot: Login/Register page]**

---

#### Step 7: Register an Account

1. Click the **"Register"** tab
2. Fill in:
   - Name: Your name
   - Email: Any email (this is for the app, not Gmail)
   - Password: At least 8 characters
3. Click **"Create Account"**

You'll be automatically logged in.

> 📷 **[Screenshot: Registration form]**

---

#### Step 8: Connect Gmail

1. **Click on your profile picture** in the top-right corner
2. Click **"Settings"** from the dropdown menu

> 📷 **[Screenshot: User dropdown menu with Settings highlighted]**

3. You'll see the **"Connected Email Accounts"** section
4. Find the **Gmail** card
5. Click the **"Connect Gmail"** button

> 📷 **[Screenshot: Settings page with Gmail connection card]**

6. **Google OAuth flow**:
   - You'll be redirected to Google
   - Select your Gmail account
   - Review the permissions (read and modify emails)
   - Click **"Continue"** or **"Allow"**

> 📷 **[Screenshot: Google OAuth consent screen]**

7. **Success!** You'll be redirected back to the app
   - A green notification will show: "Gmail connected successfully!"
   - The Settings page will show your connected Gmail account

> 📷 **[Screenshot: Success notification and connected Gmail]**

---

#### Step 9: Sync Your Emails

1. In the Settings page, click the **"Sync Now"** button
2. Wait a few seconds while the app:
   - Fetches your recent Gmail messages
   - Processes each email with AI
   - Generates summaries
   - Classifies emails (Important, Spam, Newsletter, etc.)
   - Extracts action items

> 📷 **[Screenshot: Sync in progress]**

3. **View your emails**:
   - Click **"Inbox"** in the left sidebar
   - You'll see your synced emails with AI summaries
   - Try different categories: Important, Spam, Newsletters, etc.

> 📷 **[Screenshot: Inbox with synced emails and AI summaries]**

---

### ✅ You're All Set!

Your Gmail is now connected and AI-powered! You can:
- 📧 View AI-generated summaries of all emails
- 🏷️ See automatic categorization (Important, Spam, Newsletter, etc.)
- 📝 Get action items extracted from emails
- 💬 Chat with AI about your emails
- 🔄 Sync new emails anytime by clicking "Sync Now"

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" error

**Problem**: The redirect URI in your Google Cloud Console doesn't match.

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Check "Authorized redirect URIs"
4. Make sure it's exactly: `http://localhost:8787/api/oauth/gmail/callback`
   - No `https://`
   - No trailing `/`
   - Exactly `localhost:8787`, not `127.0.0.1:8787`

---

### "Access blocked: This app's request is invalid"

**Problem**: Client ID is missing or incorrect.

**Solution**:
1. Check `email-helper-worker/.dev.vars` file
2. Make sure `GMAIL_CLIENT_ID` is filled in correctly
3. Restart the dev server: Stop (`Ctrl+C`) and run `npm run dev` again

---

### "The app is blocked" or "This app is not verified"

**Problem**: Your app is in testing mode (this is normal!).

**Solution**:
1. This is expected for development
2. Click **"Advanced"** on the warning screen
3. Click **"Go to AI Email Helper (unsafe)"**
4. This only appears for apps in testing mode with your test user account

---

### Emails not syncing

**Problem**: OAuth might have failed or expired.

**Solution**:
1. Go to Settings
2. Check if Gmail shows as "Connected"
3. If not, click "Connect Gmail" again
4. Try "Sync Now" again
5. Check browser console (F12) for any error messages

---

### Can't find `.dev.vars` file

**Problem**: File might be hidden or in the wrong location.

**Solution**:
1. The file should be at: `email-helper-worker/.dev.vars`
2. On Windows, make sure "Show hidden files" is enabled
3. Create it manually if needed:
   ```bash
   # Create the file
   touch email-helper-worker/.dev.vars
   
   # Or on Windows
   type nul > email-helper-worker\.dev.vars
   ```

---

## 🔒 Security Best Practices

- ✅ **Never commit** `.dev.vars` to Git (it's in `.gitignore`)
- ✅ **Don't share** your Client Secret publicly
- ✅ **Use Cloudflare Secrets** for production deployment
- ✅ **Rotate credentials** if they're ever exposed
- ✅ **Limit OAuth scopes** to only what's needed (already configured)

---

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

