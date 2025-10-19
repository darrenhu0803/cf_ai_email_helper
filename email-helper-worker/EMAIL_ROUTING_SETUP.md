# Email Routing Setup Guide

## Quick Setup (Optional - For Real Email Reception)

If you want to receive real emails (not just simulated ones), follow these steps:

### Prerequisites
- Domain name added to Cloudflare
- Worker deployed to Cloudflare

### Steps

1. **Go to Cloudflare Dashboard**
   - Navigate to your domain
   - Click "Email" in the left sidebar
   - Click "Email Routing"

2. **Enable Email Routing**
   - Click "Get Started" or "Enable Email Routing"
   - Follow the wizard to configure DNS records

3. **Add Custom Email Address**
   - Click "Create address" or "Destination addresses"
   - Enter: `inbox@yourdomain.com` (or any prefix you want)

4. **Route to Worker**
   - In "Routing Rules" or "Actions"
   - Select "Send to Worker"
   - Choose: `email-helper-worker`

5. **Test It**
   - Send an email to: `inbox@yourdomain.com`
   - Check worker logs: `wrangler tail`
   - Email will be processed automatically!

### Verification

Send a test email and you should see in logs:
```
Email received: sender@example.com -> inbox@yourdomain.com
Email processed and stored for user: inbox, category: important
```

### Testing Without Real Domain

You don't need a domain to test! Use the simulation endpoint:

```powershell
$email = @{
    from = "test@example.com"
    to = "inbox@test.com"
    subject = "Test Email"
    content = "This is a test email"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8787/test/simulate-email" `
    -Method Post -Body $email -ContentType "application/json"
```

This simulates the entire email processing flow without needing Email Routing configured!

---

## Email Processing Flow

When an email arrives (real or simulated):

1. **Email Handler** receives the email
2. **AI Processing** classifies and summarizes
3. **Storage** saves to user's Durable Object
4. **Filtering** auto-filters spam (doesn't forward)
5. **Forwarding** non-spam emails forwarded to destination

### Email Handler Code

Located in `src/index.js`:
```javascript
async email(message, env, ctx) {
  // Extract email data
  // Process with AI
  // Store in Durable Object
  // Forward (if not spam)
}
```

---

## Daily Digest (Scheduled Task)

Runs every day at 9 AM UTC (configured in `wrangler.jsonc`):
```json
"triggers": {
  "crons": ["0 9 * * *"]
}
```

### What It Does
- Finds unread important emails
- Generates summary/digest
- Could send notification email (not implemented yet)

### Test Manually
```powershell
$data = @{ userId = "testuser" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8787/test/daily-digest" `
    -Method Post -Body $data -ContentType "application/json"
```

---

## Multiple Users

The system extracts username from email address:
- `inbox@domain.com` → userId: `inbox`
- `john@domain.com` → userId: `john`
- `sales@domain.com` → userId: `sales`

Each user gets their own Durable Object for storage.

---

## Configuration

### Change Cron Schedule

Edit `wrangler.jsonc`:
```json
"triggers": {
  "crons": [
    "0 9 * * *",    // Daily at 9 AM
    "0 18 * * *"    // Daily at 6 PM
  ]
}
```

Cron format: `minute hour day month weekday`

Examples:
- `0 * * * *` - Every hour
- `*/30 * * * *` - Every 30 minutes
- `0 0 * * 1` - Every Monday at midnight

---

## Production Deployment

1. **Deploy Worker**
   ```bash
   wrangler deploy
   ```

2. **Configure Email Routing** (in Dashboard)

3. **Test Real Email**
   ```bash
   # Send email to your address
   # Check logs
   wrangler tail
   ```

4. **Monitor**
   - View logs in Cloudflare Dashboard
   - Check Durable Object storage
   - Monitor Workers AI usage

---

## Troubleshooting

### Emails Not Being Received
- Check Email Routing is enabled
- Verify MX records are configured
- Check routing rules point to worker
- Look at wrangler tail for errors

### Processing Errors
- Check Workers AI binding is active
- Verify Durable Objects are configured
- Check worker logs for errors

### Spam Not Filtered
- AI classification may vary
- Adjust confidence threshold if needed
- Check classification logic in `llm.js`

---

## Testing Checklist

✅ Simulate important email → classified correctly  
✅ Simulate spam → filtered  
✅ Simulate newsletter → categorized  
✅ Check user inbox → emails stored  
✅ Generate digest → unread emails listed  
✅ Multiple users → separate storage  

Run: `.\test-phase4.ps1` to verify all functionality!

