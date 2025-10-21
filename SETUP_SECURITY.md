# Security & Setup Guide

## 🔒 Why We Don't Commit Credentials to Git

**Never commit sensitive credentials to Git repositories!** This applies to:
- OAuth credentials (Client ID, Client Secret)
- API keys and tokens
- Database passwords
- Private encryption keys
- Any secrets specific to your environment

**Why?**
- ❌ Git history is permanent (even if you delete, it stays in history)
- ❌ Anyone with repo access can see secrets
- ❌ Public repos expose secrets to entire internet
- ❌ Credentials can be used to access your services

---

## ✅ Safe Setup Process (For You & Others)

### Step 1: Copy the Template
```bash
cp .env.example .env.local
```

### Step 2: Add Your Credentials
Edit `.env.local` and fill in your values:
```
GMAIL_CLIENT_ID=your-actual-client-id
GMAIL_CLIENT_SECRET=your-actual-secret
GMAIL_REDIRECT_URI=http://localhost:8787/api/oauth/gmail/callback
```

### Step 3: Verify `.env.local` is Ignored
```bash
grep ".env*.local" .gitignore
# Should output: .env*.local
```

### Step 4: Make Sure You Never Commit It
```bash
git status
# Should NOT show .env.local
```

---

## 📋 Files in the Repository

### ✅ SAFE to commit:
- `.env.example` - Template showing what variables are needed
- `wrangler.jsonc` - Configuration without secrets
- `GMAIL_SETUP_GUIDE.md` - Instructions for setup
- All source code

### ❌ NEVER commit:
- `.env` - Contains actual credentials
- `.env.local` - Your local credentials
- `.env.production` - Production secrets
- Any files with "secret" or "credentials" in the name
- `wrangler.toml` if it has secrets (use `wrangler secret put` instead)

---

## 🚀 How Others Can Use This Repository

### For Contributors (Development)
```bash
# 1. Clone the repo
git clone https://github.com/yourusername/cf_ai_email_helper.git
cd cf_ai_email_helper

# 2. Copy template
cp .env.example .env.local

# 3. Follow GMAIL_SETUP_GUIDE.md to add their own credentials
# (They create their own Google OAuth app)

# 4. Run the app
npm run dev
```

### For Production Deployment
```bash
# Use Cloudflare Secrets (NOT environment variables)
npx wrangler secret put GMAIL_CLIENT_SECRET
# Prompted to enter the secret value

# Sensitive config stays in Cloudflare, never in Git
```

---

## 🔐 Environment Variable Hierarchy

**Local Development** (`.env.local` - git ignored):
```
GMAIL_CLIENT_ID=dev-client-id
GMAIL_CLIENT_SECRET=dev-secret
```

**Production** (Cloudflare Secrets):
```bash
npx wrangler secret put GMAIL_CLIENT_SECRET
# Stored in Cloudflare, never committed
```

---

## 📖 How wrangler.jsonc Works

In development, wrangler loads from `.env.local`:
```jsonc
{
  "vars": {
    "GMAIL_CLIENT_ID": "",
    "GMAIL_CLIENT_SECRET": "",
    "GMAIL_REDIRECT_URI": "http://localhost:8787/api/oauth/gmail/callback"
  }
}
```

The empty values are overridden by your `.env.local` file automatically!

---

## 🛡️ Best Practices

1. **Use `.env.example`** - Document what variables are needed
2. **Keep secrets out of code** - Use environment variables
3. **Use `.gitignore`** - Prevent accidental commits
4. **Add a setup guide** - Like GMAIL_SETUP_GUIDE.md
5. **Document for others** - Make setup easy
6. **Use secrets manager** - Cloudflare Secrets for production
7. **Review before committing** - `git status` to check
8. **Add to CI/CD** - Inject secrets during deployment

---

## 🎯 The Result

✅ **Public repo is safe** - no credentials exposed
✅ **Easy for developers** - just copy `.env.example` and add credentials
✅ **Easy for production** - use Cloudflare Secrets
✅ **No Git history pollution** - no need to rotate compromised credentials
✅ **Everyone can contribute** - with their own credentials

---

## 📚 More Resources

- [Twelve Factor App - Environment Variables](https://12factor.net/config)
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [GitHub - Removing sensitive data from history](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
