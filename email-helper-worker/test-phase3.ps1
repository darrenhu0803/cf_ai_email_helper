# Phase 3 Test Script: LLM Integration (PowerShell)
# Tests email summarization, classification, and AI chat

$BASE_URL = "http://localhost:8787"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Phase 3: Testing LLM Integration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "✓ Test 1: Health Check" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
    $response | ConvertTo-Json
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 2: Summarize Important Email
Write-Host "✓ Test 2: Summarize Important Work Email" -ForegroundColor Green
try {
    $emailData = @{
        emailContent = "Hi team, I wanted to follow up on the project deadline we discussed last week. We need to finalize the requirements by Friday and start development next week. Please review the attached documents and provide feedback by Wednesday. The client meeting is scheduled for next Tuesday at 2 PM. Let me know if you have any questions or concerns. Thanks, Sarah"
        from = "sarah@company.com"
        subject = "Project Deadline Follow-up"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/summarize" -Method Post -Body $emailData -ContentType "application/json"
    Write-Host "Summary:" -ForegroundColor Yellow
    Write-Host $response.summary
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 3: Classify Spam Email
Write-Host "✓ Test 3: Classify Obvious Spam" -ForegroundColor Green
try {
    $spamData = @{
        emailContent = "CONGRATULATIONS!!! You have WON $1,000,000! Click here NOW to claim your prize! Limited time offer! Act IMMEDIATELY! This is NOT a scam!"
        from = "winner@prizes.biz"
        subject = "YOU WON!!!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/classify" -Method Post -Body $spamData -ContentType "application/json"
    Write-Host "Classification:" -ForegroundColor Yellow
    $response.classification | ConvertTo-Json
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 4: Classify Important Email
Write-Host "✓ Test 4: Classify Important Work Email" -ForegroundColor Green
try {
    $importantData = @{
        emailContent = "Hi John, Your invoice #12345 for $500 is due in 3 days. Please process payment at your earliest convenience. Let me know if you have any questions. Regards, Accounting"
        from = "accounting@company.com"
        subject = "Invoice Payment Due"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/classify" -Method Post -Body $importantData -ContentType "application/json"
    Write-Host "Classification:" -ForegroundColor Yellow
    $response.classification | ConvertTo-Json
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 5: Classify Newsletter
Write-Host "✓ Test 5: Classify Newsletter" -ForegroundColor Green
try {
    $newsletterData = @{
        emailContent = "Welcome to your weekly tech newsletter! This week's highlights include: new AI developments, cloud computing trends, and startup news. Read more at our website."
        from = "newsletter@techdigest.com"
        subject = "Your Weekly Tech Digest - October Edition"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/classify" -Method Post -Body $newsletterData -ContentType "application/json"
    Write-Host "Classification:" -ForegroundColor Yellow
    $response.classification | ConvertTo-Json
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 6: Process Complete Email
Write-Host "✓ Test 6: Process Full Email (Classify + Summarize)" -ForegroundColor Green
try {
    $fullEmail = @{
        from = "manager@company.com"
        to = "team@company.com"
        subject = "Quarterly Report Review"
        content = "Hi team, Please review the Q3 quarterly report attached. We need to discuss the findings in our meeting next week. Pay special attention to the revenue projections on page 5 and the cost analysis in section 3. Let me know if you have questions before the meeting. Thanks, Manager"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/process-email" -Method Post -Body $fullEmail -ContentType "application/json"
    Write-Host "Processed Email:" -ForegroundColor Yellow
    Write-Host "Category: $($response.email.category)"
    Write-Host "Summary: $($response.email.summary)"
    Write-Host "Action Items: $($response.email.actionItems -join ', ')"
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 7: AI Chat without Context
Write-Host "✓ Test 7: AI Chat - General Query" -ForegroundColor Green
try {
    $chatData = @{
        message = "Hello! Can you help me manage my emails?"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/ai-chat" -Method Post -Body $chatData -ContentType "application/json"
    Write-Host "AI Response:" -ForegroundColor Yellow
    Write-Host $response.response
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 8: AI Chat with Email Context
Write-Host "✓ Test 8: AI Chat - Query with Email Context" -ForegroundColor Green
try {
    $chatWithContext = @{
        message = "Show me important emails from today"
        emails = @(
            @{
                from = "boss@company.com"
                subject = "Urgent: Project Update Needed"
                category = "important"
                summary = "Boss needs project update by end of day"
            },
            @{
                from = "spam@example.com"
                subject = "Get rich quick!"
                category = "spam"
            }
        )
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "$BASE_URL/test/ai-chat" -Method Post -Body $chatWithContext -ContentType "application/json"
    Write-Host "AI Response:" -ForegroundColor Yellow
    Write-Host $response.response
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 9: Integrated API - Process and Store Email
Write-Host "✓ Test 9: Integrated API - Process & Store Email" -ForegroundColor Green
try {
    $apiEmail = @{
        userId = "testuser"
        rawEmail = @{
            from = "client@external.com"
            subject = "Contract Review Request"
            content = "Hi, could you please review the attached contract and provide feedback by Thursday? We need to finalize this before our board meeting. Thanks!"
        }
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "$BASE_URL/api/email/process" -Method Post -Body $apiEmail -ContentType "application/json"
    Write-Host "Stored Email ID: $($response.email.id)" -ForegroundColor Yellow
    Write-Host "Category: $($response.email.category)"
    Write-Host "Summary: $($response.email.summary)"
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 10: Integrated API - Chat with Context
Write-Host "✓ Test 10: Integrated API - Chat with Full Context" -ForegroundColor Green
try {
    # First ensure user and session exist
    $userData = @{ preferences = @{ filterSpam = $true } } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/test/user/testuser" -Method Post -Body $userData -ContentType "application/json" | Out-Null

    $sessionData = @{ userId = "testuser" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/test/chat/testsession" -Method Post -Body $sessionData -ContentType "application/json" | Out-Null

    # Now chat
    $chatRequest = @{
        message = "What emails do I have about contracts?"
        userId = "testuser"
        sessionId = "testsession"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/api/chat" -Method Post -Body $chatRequest -ContentType "application/json"
    Write-Host "AI Response:" -ForegroundColor Yellow
    Write-Host $response.response
    Write-Host "Context: $($response.context.emailCount) emails, $($response.context.historyCount) history messages"
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Phase 3 Tests Complete! ✅" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected Results:"
Write-Host "  ✓ Email summarization generates concise summaries"
Write-Host "  ✓ Spam detected correctly"
Write-Host "  ✓ Important emails classified accurately"
Write-Host "  ✓ Newsletters identified"
Write-Host "  ✓ Full email processing works"
Write-Host "  ✓ AI chat responds intelligently"
Write-Host "  ✓ Context-aware responses"
Write-Host "  ✓ Integration API functional"
Write-Host ""
Write-Host "If all tests passed, Phase 3 is complete!" -ForegroundColor Green
Write-Host "Ready to move to Phase 4: Email Processing Workflow" -ForegroundColor Yellow

