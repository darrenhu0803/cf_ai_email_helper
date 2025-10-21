# Quick Gmail Setup Guide

## 🚀 5-Minute Setup

### Step 1: Create Google Cloud Project (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Email Helper" → Click "Create"

### Step 2: Enable Gmail API (30 seconds)

1. In the search bar, type "Gmail API"
2. Click "Gmail API" in results
3. Click "Enable"

### Step 3: Create OAuth Credentials (2 minutes)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. **First time?** Configure consent screen:
   - User Type: **External**
   - App name: **Email Helper**
   - User support email: **your-email@gmail.com**
   - Developer contact: **your-email@gmail.com**
   - Click "Save and Continue" (skip optional fields)
   - **Scopes**: Click "Add or Remove Scopes"
     - Search for "Gmail API" 
     - Select: `https://www.googleapis.com/auth/gmail.readonly`
     - Select: `https://www.googleapis.com/auth/gmail.modify`
     - Click "Update" → "Save and Continue"
   - **Test users**: Add your Gmail address
   - Click "Save and Continue" → "Back to Dashboard"

4. **Create OAuth Client**:
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: **Email Helper**
   - Authorized redirect URIs:
     - Add: `http://localhost:8787/api/oauth/gmail/callback`
     - For production, also add: `https://your-worker-url.workers.dev/api/oauth/gmail/callback`
   - Click "Create"

5. **Copy your credentials**:
   - You'll see a popup with "Client ID" and "Client Secret"
   - Copy both values

### Step 4: Configure the App (30 seconds)

1. Open `cf_ai_email_helper/email-helper-worker/wrangler.jsonc`
2. Find the `vars` section:
   ```jsonc
   "vars": {
     "GMAIL_CLIENT_ID": "",           // Paste Client ID here
     "GMAIL_CLIENT_SECRET": "",       // Paste Client Secret here
     "GMAIL_REDIRECT_URI": "http://localhost:8787/api/oauth/gmail/callback"
   }
   ```
3. Paste your Client ID and Client Secret
4. Save the file

### Step 5: Restart & Connect (30 seconds)

1. **Restart the worker**:
   ```bash
   # Stop the current dev server (Ctrl+C)
   cd cf_ai_email_helper
   npm run dev
   ```

2. **Connect your Gmail**:
   - Open the app in your browser
   - Click your profile icon → "Settings"
   - Click "Connect Gmail"
   - Authorize the app
   - Click "Sync Now"

Done! ✅ Your emails will now sync automatically!

---

## 📋 Example Configuration

Your `wrangler.jsonc` should look like this:

```jsonc
{
  "name": "email-helper-worker",
  // ... other config ...
  "vars": {
    "GMAIL_CLIENT_ID": "1234567890-abc123xyz.apps.googleusercontent.com",
    "GMAIL_CLIENT_SECRET": "GOCSPX-abcdefghijklmnop",
    "GMAIL_REDIRECT_URI": "http://localhost:8787/api/oauth/gmail/callback"
  }
}
```

---

## 🔒 Production Deployment

For production, **DON'T** put secrets in `wrangler.jsonc`. Use Cloudflare Secrets instead:

```bash
# Set secrets (prompted to enter value)
npx wrangler secret put GMAIL_CLIENT_SECRET

# Update redirect URI in wrangler.jsonc for production
"GMAIL_REDIRECT_URI": "https://your-worker.your-subdomain.workers.dev/api/oauth/gmail/callback"
```

Also update your Google Cloud Console:
- Add production redirect URI to "Authorized redirect URIs"
- Publish your OAuth consent screen (if you need more than 100 users)

---

## 🐛 Troubleshooting

### "Error 400: redirect_uri_mismatch"
- The redirect URI in Google Cloud Console must **exactly** match the one in your worker
- Check for trailing slashes, http vs https

### "OAuth client not configured"
- Make sure you've copied Client ID and Client Secret correctly
- Restart the worker after changing config

### "The app is blocked"
- Your app is in testing mode (normal for development)
- Add your Gmail address to "Test users" in OAuth consent screen

### "Connection error" when clicking Connect Gmail
- Make sure GMAIL_CLIENT_ID is set in wrangler.jsonc
- Check that the worker restarted after config changes

---

## 🎉 What Works Now

Once connected, you can:
- ✅ Sync your Gmail messages
- ✅ See AI summaries of all emails
- ✅ Automatic categorization (Important, Spam, Newsletter, etc.)
- ✅ Action items extracted from emails
- ✅ Chat with AI about your emails
- ✅ Periodic auto-sync (coming soon with Cron)

---

## 📚 More Info

- Full OAuth setup guide: See `OAUTH_SETUP.md`
- Google OAuth docs: https://developers.google.com/identity/protocols/oauth2
- Cloudflare Workers: https://developers.cloudflare.com/workers/

