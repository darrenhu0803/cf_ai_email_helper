# 🔒 Security Setup Guide

## Important: Never Commit Secrets!

OAuth credentials and API keys should **NEVER** be committed to git. Here's how to handle them securely:

## For Local Development

### 1. Use `.dev.vars` (Already Configured ✅)

Wrangler automatically loads secrets from `.dev.vars` during local development.

**File: `email-helper-worker/.dev.vars`** (git-ignored)
```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret-here
```

✅ This file is in `.gitignore` - it won't be committed  
✅ Wrangler loads it automatically when you run `npm run dev`  
✅ Each developer can have their own credentials

### 2. Setup Instructions

1. **Copy the example file:**
   ```bash
   cd email-helper-worker
   cp .dev.vars.example .dev.vars
   ```

2. **Edit `.dev.vars` with your credentials:**
   - Get them from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Replace the placeholder values

3. **Never commit `.dev.vars`:**
   - It's already in `.gitignore` ✅
   - Git will ignore it automatically

## For Production Deployment

### Use Cloudflare Secrets (Encrypted Storage)

Secrets are stored encrypted in Cloudflare's infrastructure and never visible in your code.

```bash
cd email-helper-worker

# Set Gmail Client Secret (encrypted)
npx wrangler secret put GMAIL_CLIENT_SECRET
# Paste your secret when prompted

# Set Gmail Client ID (can be in wrangler.toml as it's less sensitive)
# Or use secrets for this too:
npx wrangler secret put GMAIL_CLIENT_ID
```

### Production `wrangler.jsonc`

For production, you can add non-sensitive config:

```jsonc
{
  "vars": {
    "GMAIL_REDIRECT_URI": "https://your-worker.workers.dev/api/oauth/gmail/callback"
  }
}
```

**Note:** `GMAIL_CLIENT_ID` is semi-public (visible in OAuth URLs), but `GMAIL_CLIENT_SECRET` should ALWAYS be a secret.

## What's Safe to Commit?

✅ **Safe:**
- `wrangler.jsonc` (without secrets)
- `.dev.vars.example` (template with placeholders)
- Public configuration
- Redirect URIs

❌ **Never Commit:**
- `.dev.vars` (actual credentials)
- OAuth secrets
- API keys
- User tokens
- Database passwords

## If You Accidentally Committed Secrets

### 🚨 Immediate Actions:

1. **Revoke the credentials immediately:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Delete the compromised OAuth client
   - Create new credentials

2. **Remove from git history:**
   ```bash
   # This rewrites history - coordinate with team!
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch email-helper-worker/.dev.vars" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (be careful!)
   git push origin --force --all
   ```

3. **Add to `.gitignore` if not already there**

4. **Rotate all secrets**

## Best Practices

1. ✅ Use `.dev.vars` for local development
2. ✅ Use Cloudflare Secrets for production
3. ✅ Never put secrets in `wrangler.jsonc`
4. ✅ Never put secrets in code
5. ✅ Add `.dev.vars` to `.gitignore`
6. ✅ Provide `.dev.vars.example` for team
7. ✅ Rotate secrets if compromised
8. ✅ Use different credentials for dev/prod

## Current Setup Status

✅ `.gitignore` includes `.dev.vars`  
✅ `.dev.vars.example` created as template  
✅ `wrangler.jsonc` has no secrets  
✅ Credentials moved to `.dev.vars`

## Team Onboarding

When a new developer joins:

1. Share the repository (credentials not included)
2. Ask them to create Google Cloud credentials
3. Have them copy `.dev.vars.example` to `.dev.vars`
4. They add their own credentials
5. They run `npm run dev` - it just works!

---

**Remember:** Secrets in git = Security breach. Always use proper secret management! 🔒

