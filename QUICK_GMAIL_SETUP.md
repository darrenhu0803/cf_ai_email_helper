# Quick Gmail OAuth Setup (5 minutes)

You're seeing the "Missing client_id" error because Gmail OAuth credentials aren't configured yet. Here's how to fix it:

## Step 1: Get Google OAuth Credentials

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create/Select a Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it: "AI Email Helper"
   - Click "Create"

3. **Enable Gmail API**
   - In the left menu: "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click on it → Click "Enable"

4. **Create OAuth Credentials**
   - Left menu: "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   
   - **If OAuth consent screen not configured:**
     - Click "Configure Consent Screen"
     - Choose "External" → Click "Create"
     - Fill in:
       - App name: `AI Email Helper`
       - User support email: `your-email@gmail.com`
       - Developer contact: `your-email@gmail.com`
     - Click "Save and Continue" (skip optional steps)
     - Add test users: Add your Gmail address
     - Click "Save and Continue"
   
   - **Create the OAuth Client:**
     - Application type: **Web application**
     - Name: `Email Helper Local Dev`
     - Authorized redirect URIs: 
       - `http://localhost:8787/api/oauth/gmail/callback`
     - Click "Create"
   
5. **Copy Your Credentials**
   - You'll see a popup with:
     - **Client ID**: Something like `123456789.apps.googleusercontent.com`
     - **Client Secret**: Something like `GOCSPX-abc123xyz`
   - **Keep this window open or download the JSON**

## Step 2: Add Credentials to Worker

1. **Open** `email-helper-worker/wrangler.jsonc`

2. **Find the `vars` section** (around line 45)

3. **Replace the placeholders** with your actual credentials:

```jsonc
"vars": {
  "GMAIL_CLIENT_ID": "123456789-abc.apps.googleusercontent.com",  // ← Your Client ID
  "GMAIL_CLIENT_SECRET": "GOCSPX-your-secret-here",               // ← Your Client Secret
  "GMAIL_REDIRECT_URI": "http://localhost:8787/api/oauth/gmail/callback"
}
```

4. **Save the file**

## Step 3: Restart the Worker

In your terminal:

```bash
# Press Ctrl+C to stop the worker
# Then restart:
cd email-helper-worker
npm run dev
```

## Step 4: Connect Gmail

1. **Refresh your browser** at `http://localhost:5173`
2. **Click your profile** → **Settings**
3. **Click "Connect"** next to Gmail
4. **Authorize** with Google (it will say "Google hasn't verified this app" - that's normal for testing)
5. Click **"Advanced"** → **"Go to AI Email Helper (unsafe)"**
6. Click **"Continue"** → **Allow** all permissions
7. You'll be redirected back to the app
8. Click **"Sync Now"** to fetch your emails!

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console **exactly** matches:
  `http://localhost:8787/api/oauth/gmail/callback`
- No trailing slash!

### "This app hasn't been verified"
- This is normal for development
- Click "Advanced" → "Go to AI Email Helper (unsafe)"
- To remove this warning, you'd need to publish the app (not needed for testing)

### "Access blocked: Authorization Error"
- Make sure you added yourself as a test user in the OAuth consent screen

## Quick Test

After setup, try this in your browser console:

```javascript
fetch('http://localhost:8787/api/oauth/gmail/start', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)

// Should return: { success: true, authUrl: "https://accounts.google.com/..." }
```

---

## Production Setup

For production, use Cloudflare Secrets instead:

```bash
cd email-helper-worker
npx wrangler secret put GMAIL_CLIENT_SECRET
# Enter your client secret when prompted
```

And update redirect URI to your production domain:
- `https://your-worker.your-subdomain.workers.dev/api/oauth/gmail/callback`

---

Need more details? See `OAUTH_SETUP.md` for the complete guide.

