# Test script to add emails to your account
# Run this after logging in to see emails in the UI

Write-Host "Adding test emails to your account..." -ForegroundColor Cyan

# Email 1: Important work email
$email1 = @{
    from = "boss@company.com"
    to = "2005082ze@gmail.com"
    subject = "Urgent: Q4 Report Review"
    content = "Hi, I need you to review the Q4 financial report by end of day. Please prioritize this. The board meeting is tomorrow morning at 9 AM. Thanks!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8787/test/simulate-email" `
    -Method POST `
    -ContentType "application/json" `
    -Body $email1

Write-Host "✓ Added important work email" -ForegroundColor Green

# Email 2: Newsletter
$email2 = @{
    from = "newsletter@techcrunch.com"
    to = "2005082ze@gmail.com"
    subject = "TechCrunch Daily: AI News Roundup"
    content = "Welcome to today's tech news! Top stories: New AI breakthrough announced, Cloud computing trends, and more. Subscribe to premium for full access."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8787/test/simulate-email" `
    -Method POST `
    -ContentType "application/json" `
    -Body $email2

Write-Host "✓ Added newsletter" -ForegroundColor Green

# Email 3: Promotional
$email3 = @{
    from = "deals@amazon.com"
    to = "2005082ze@gmail.com"
    subject = "🎉 50% Off Holiday Sale - Today Only!"
    content = "Don't miss out! Huge discounts on electronics, fashion, and home goods. Limited time offer. Shop now and save big! Free shipping on orders over $25."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8787/test/simulate-email" `
    -Method POST `
    -ContentType "application/json" `
    -Body $email3

Write-Host "✓ Added promotional email" -ForegroundColor Green

# Email 4: Social
$email4 = @{
    from = "notifications@facebook.com"
    to = "2005082ze@gmail.com"
    subject = "John Smith commented on your post"
    content = "John Smith commented: 'Great photo! Where was this taken?' You have 3 new notifications. Click here to see all your updates."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8787/test/simulate-email" `
    -Method POST `
    -ContentType "application/json" `
    -Body $email4

Write-Host "✓ Added social notification" -ForegroundColor Green

# Email 5: Spam
$email5 = @{
    from = "winner@lottery-claim.biz"
    to = "2005082ze@gmail.com"
    subject = "CONGRATULATIONS!!! You have Won 1 Million Dollars"
    content = "Dear lucky winner, you have been selected to receive ONE MILLION DOLLARS. Click here immediately to claim your prize. Act now before it expires!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8787/test/simulate-email" `
    -Method POST `
    -ContentType "application/json" `
    -Body $email5

Write-Host "✓ Added spam email" -ForegroundColor Green

Write-Host "`n✅ Done! Added 5 test emails." -ForegroundColor Cyan
Write-Host "Refresh your browser to see them!" -ForegroundColor Yellow

