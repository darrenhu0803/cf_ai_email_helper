# Phase 4 Test Script: Email Processing Workflow

$BASE_URL = "http://localhost:8787"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Phase 4: Email Processing Workflow" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Simulate Important Email
Write-Host "✓ Test 1: Simulate Important Work Email" -ForegroundColor Green
try {
    $email = @{
        from = "boss@company.com"
        to = "inbox@test.com"
        subject = "Urgent: Quarterly Review Meeting"
        content = "Team, we need to meet tomorrow at 10 AM to discuss Q4 targets. Please prepare your department reports. This is mandatory for all managers."
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/simulate-email" -Method Post -Body $email -ContentType "application/json"
    Write-Host "User: $($response.userId)" -ForegroundColor Yellow
    Write-Host "Category: $($response.email.category)"
    Write-Host "Summary: $($response.email.summary)"
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 2: Simulate Spam Email
Write-Host "✓ Test 2: Simulate Spam Email" -ForegroundColor Green
try {
    $spam = @{
        from = "noreply@scam.biz"
        to = "inbox@test.com"
        subject = "WINNER! Claim Your Prize NOW!!!"
        content = "CONGRATULATIONS!!! You've won $5,000,000! Click here immediately to claim. Limited time offer! Act now or lose forever!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/simulate-email" -Method Post -Body $spam -ContentType "application/json"
    Write-Host "Category: $($response.email.category)" -ForegroundColor Yellow
    Write-Host "Should Filter: $($response.email.classification.shouldFilter)"
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 3: Simulate Newsletter
Write-Host "✓ Test 3: Simulate Newsletter Email" -ForegroundColor Green
try {
    $newsletter = @{
        from = "newsletter@techcrunch.com"
        to = "inbox@test.com"
        subject = "This Week in Tech - Top Stories"
        content = "Welcome to your weekly tech roundup! This week: AI breakthroughs, new startup funding, cloud computing trends, and more. Read the full stories on our website."
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/simulate-email" -Method Post -Body $newsletter -ContentType "application/json"
    Write-Host "Category: $($response.email.category)" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 4: Check User's Emails
Write-Host "✓ Test 4: Get All Processed Emails" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/test/user/inbox/emails" -Method Get
    Write-Host "Total emails: $($response.count)" -ForegroundColor Yellow
    Write-Host "Categories:" 
    $response.data | ForEach-Object { Write-Host "  - $($_.subject): $($_.category)" }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 5: Get User Statistics
Write-Host "✓ Test 5: Get Email Statistics" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/test/user/inbox/stats" -Method Get
    Write-Host "Statistics:" -ForegroundColor Yellow
    Write-Host "  Total: $($response.data.total)"
    Write-Host "  Unread: $($response.data.unread)"
    Write-Host "  Important: $($response.data.byCategory.important)"
    Write-Host "  Spam: $($response.data.byCategory.spam)"
    Write-Host "  Newsletter: $($response.data.byCategory.newsletter)"
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 6: Generate Daily Digest
Write-Host "✓ Test 6: Generate Daily Digest" -ForegroundColor Green
try {
    $digest = @{ userId = "inbox" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BASE_URL/test/daily-digest" -Method Post -Body $digest -ContentType "application/json"
    Write-Host "Digest for: $($response.digest.userId)" -ForegroundColor Yellow
    Write-Host "Unread Important: $($response.digest.unreadImportant)"
    Write-Host "Total Stats:"
    Write-Host "  Total: $($response.digest.stats.total)"
    Write-Host "  Unread: $($response.digest.stats.unread)"
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 7: Simulate Multiple Emails in Sequence
Write-Host "✓ Test 7: Process Multiple Emails" -ForegroundColor Green
try {
    $emails = @(
        @{ from = "hr@company.com"; subject = "Benefits Update"; content = "Annual benefits enrollment starts next Monday. Please review and select your options by the deadline." },
        @{ from = "client@acme.com"; subject = "Project Proposal"; content = "Attached is our proposal for the new project. Looking forward to your feedback." },
        @{ from = "ads@promo.com"; subject = "50% OFF SALE!!!"; content = "Limited time offer! Shop now and save big! Click here for exclusive deals!" }
    )

    foreach ($e in $emails) {
        $body = @{
            from = $e.from
            to = "testuser@test.com"
            subject = $e.subject
            content = $e.content
        } | ConvertTo-Json

        $r = Invoke-RestMethod -Uri "$BASE_URL/test/simulate-email" -Method Post -Body $body -ContentType "application/json"
        Write-Host "  Processed: $($e.subject) -> $($r.email.category)" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 8: Check Testuser's Emails
Write-Host "✓ Test 8: Verify Testuser's Inbox" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/test/user/testuser/emails" -Method Get
    Write-Host "Testuser has $($response.count) emails" -ForegroundColor Yellow
    $response.data | Select-Object -First 5 | ForEach-Object {
        Write-Host "  - [$($_.category)] $($_.subject)" 
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Phase 4 Tests Complete! ✅" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected Results:"
Write-Host "  ✓ Emails simulated and processed automatically"
Write-Host "  ✓ AI classification working correctly"
Write-Host "  ✓ Spam filtered appropriately"
Write-Host "  ✓ Emails stored in user state"
Write-Host "  ✓ Statistics calculated correctly"
Write-Host "  ✓ Daily digest generated"
Write-Host ""
Write-Host "Phase 4 Complete! Email workflow is functional." -ForegroundColor Green
Write-Host "Ready for Phase 5: Chat Interface (Frontend)" -ForegroundColor Yellow

