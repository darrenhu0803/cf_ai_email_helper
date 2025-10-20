# Email Provider OAuth Setup Guide

This guide explains how to set up OAuth for Gmail and other email providers.

## Gmail OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

### 2. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure OAuth consent screen (if not done):
   - User Type: External
   - App name: AI Email Helper
   - Support email: your-email@example.com
   - Authorized domains: your-domain.com
   - Scopes: Add Gmail readonly and modify scopes
4. Create OAuth Client ID:
   - Application type: Web application
   - Name: Email Helper Worker
   - Authorized redirect URIs:
     - `http://localhost:8787/api/oauth/gmail/callback` (development)
     - `https://your-worker.your-subdomain.workers.dev/api/oauth/gmail/callback` (production)
5. Save the Client ID and Client Secret

### 3. Configure Worker

Add to `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "GMAIL_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
    "GMAIL_REDIRECT_URI": "http://localhost:8787/api/oauth/gmail/callback"
  }
}
```

Add secrets (production):

```bash
npx wrangler secret put GMAIL_CLIENT_SECRET
# Enter your client secret when prompted
```

### 4. Test OAuth Flow

1. Start the worker: `npm run dev`
2. Visit: `http://localhost:8787/api/oauth/gmail/start`
3. Follow the OAuth flow
4. You'll be redirected back with tokens

## Using Gmail OAuth in the UI

### Connect Gmail

```javascript
// In your React component
const connectGmail = async () => {
  const response = await fetch('http://localhost:8787/api/oauth/gmail/start', {
    credentials: 'include'
  });
  const data = await response.json();
  
  if (data.success) {
    window.location.href = data.authUrl;
  }
};
```

### Sync Gmail Messages

```javascript
const syncGmail = async () => {
  const response = await fetch('http://localhost:8787/api/email-providers/gmail/sync', {
    method: 'POST',
    credentials: 'include'
  });
  const data = await response.json();
  
  console.log(`Synced ${data.synced} emails`);
};
```

### Check Connected Providers

```javascript
const getProviders = async () => {
  const response = await fetch('http://localhost:8787/api/email-providers', {
    credentials: 'include'
  });
  const data = await response.json();
  
  console.log('Connected providers:', data.providers);
};
```

## Outlook OAuth Setup

Coming soon! The infrastructure is in place to support multiple providers.

### Scopes Needed:
- `https://outlook.office.com/Mail.Read`
- `https://outlook.office.com/Mail.ReadWrite`

## Security Notes

1. **Never commit OAuth secrets** - Use Cloudflare Secrets for production
2. **Use HTTPS in production** - OAuth requires secure redirect URIs
3. **Validate state parameter** - Prevents CSRF attacks
4. **Refresh tokens securely** - Store encrypted in Durable Objects
5. **Token expiration** - Automatically refreshes tokens when needed

## API Endpoints

### Start OAuth Flow
```
GET /api/oauth/gmail/start
Authorization: Bearer <session-token>

Response:
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/..."
}
```

### OAuth Callback
```
GET /api/oauth/gmail/callback?code=...&state=...

Redirects to frontend with success/error
```

### Get Connected Providers
```
GET /api/email-providers
Authorization: Bearer <session-token>

Response:
{
  "success": true,
  "providers": [
    {
      "provider": "gmail",
      "email": "user@gmail.com",
      "connectedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Sync Gmail
```
POST /api/email-providers/gmail/sync
Authorization: Bearer <session-token>

Response:
{
  "success": true,
  "synced": 5,
  "emails": [...]
}
```

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the redirect URI in Google Cloud Console exactly matches the one in your code
- Check for trailing slashes
- Verify HTTP vs HTTPS

### "invalid_client" Error
- Check that Client ID and Client Secret are correct
- Ensure secrets are properly set in Cloudflare

### Token Refresh Issues
- Ensure `access_type=offline` is set to get refresh tokens
- Check that refresh tokens are being stored correctly

## Next Steps

1. Add UI components for connecting email accounts
2. Implement periodic sync (using Cron Triggers)
3. Add support for more providers (Outlook, Yahoo, etc.)
4. Implement webhook listeners for real-time email delivery

