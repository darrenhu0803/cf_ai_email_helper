# Quick Gmail OAuth Setup Guide

Follow these simple steps to connect your Gmail account to the app.

## Step 1: Create Google Cloud Project (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name it: `Email Helper App`
4. Click **Create**

## Step 2: Enable Gmail API (2 minutes)

1. In your new project, go to **"APIs & Services" > "Library"**
2. Search for **"Gmail API"**
3. Click on it and press **"Enable"**

## Step 3: Configure OAuth Consent Screen (3 minutes)

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** and click **Create**
3. Fill in required fields:
   - **App name**: AI Email Helper
   - **User support email**: your email
   - **Developer contact**: your email
4. Click **"Save and Continue"**
5. On Scopes page: **Skip** (click "Save and Continue")
6. On Test users page: **Add your email** as a test user
7. Click **"Save and Continue"**, then **"Back to Dashboard"**

## Step 4: Create OAuth Credentials (3 minutes)

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth client ID"**
3. Choose **"Web application"**
4. Name it: `Email Helper Worker`
5. Under **"Authorized redirect URIs"**, click **"Add URI"** and enter:
   ```
   http://localhost:8787/api/oauth/gmail/callback
   ```
6. Click **Create**
7. **IMPORTANT**: Copy the **Client ID** and **Client Secret**

## Step 5: Add Credentials to Worker (2 minutes)

### For Development (Local):

1. Open `cf_ai_email_helper/email-helper-worker/wrangler.jsonc`
2. Find the `vars` section and add:
   ```jsonc
   "vars": {
     "GMAIL_CLIENT_ID": "your-client-id-here.apps.googleusercontent.com",
     "GMAIL_REDIRECT_URI": "http://localhost:8787/api/oauth/gmail/callback"
   }
   ```

3. Create a file: `cf_ai_email_helper/email-helper-worker/.dev.vars`
4. Add your client secret:
   ```
   GMAIL_CLIENT_SECRET=your-client-secret-here
   ```

5. **Restart your worker**: Stop `npm run dev` and start it again

## Step 6: Connect Gmail in the App! 🎉

1. In the app, click your **profile icon** (top right)
2. Click **"Settings"**
3. Click **"Connect Gmail"**
4. You'll be redirected to Google
5. Choose your account and grant permissions
6. You'll be redirected back to the app
7. Click **"Sync Now"** to fetch your emails!

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Console **exactly** matches: `http://localhost:8787/api/oauth/gmail/callback`
- No trailing slash!
- Check it's `http://` not `https://` for local development

### "invalid_client" Error  
- Double-check your Client ID and Client Secret are correct
- Make sure you restarted the worker after adding credentials

### No emails showing after sync
- Check the browser console for errors
- Make sure you have emails in your Gmail inbox
- Try the test email script first: `powershell -ExecutionPolicy Bypass -File test-add-emails.ps1`

## What Permissions Does the App Request?

- **gmail.readonly**: Read your emails (cannot send or delete)
- **gmail.modify**: Mark emails as read/unread (needed for management)

The app **NEVER**:
- Sends emails on your behalf
- Deletes emails
- Shares your data with anyone
- Stores emails outside your Cloudflare worker

## For Production Deployment

When deploying to production, use Cloudflare Secrets instead:

```bash
cd email-helper-worker
npx wrangler secret put GMAIL_CLIENT_ID
# Enter your client ID when prompted

npx wrangler secret put GMAIL_CLIENT_SECRET
# Enter your client secret when prompted

npx wrangler secret put GMAIL_REDIRECT_URI
# Enter: https://your-worker.your-subdomain.workers.dev/api/oauth/gmail/callback
```

And update the redirect URI in Google Cloud Console to match your production URL.

---

**Need help?** Check `OAUTH_SETUP.md` for more detailed information.

