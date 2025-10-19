# Phase 2 Test Script: Durable Objects (PowerShell)
# Tests UserState and ChatSession functionality

$BASE_URL = "http://localhost:8787"
$USER_ID = "test123"
$SESSION_ID = "session_abc"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Phase 2: Testing Durable Objects" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "✓ Test 1: Health Check" -ForegroundColor Green
$response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 2: Create User
Write-Host "✓ Test 2: Create User State" -ForegroundColor Green
$userData = @{
    preferences = @{
        filterSpam = $true
    }
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$BASE_URL/test/user/$USER_ID" -Method Post -Body $userData -ContentType "application/json"
$response | ConvertTo-Json
Write-Host ""

# Test 3: Get User State
Write-Host "✓ Test 3: Get User State" -ForegroundColor Green
$response = Invoke-RestMethod -Uri "$BASE_URL/test/user/$USER_ID" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 4: Add Email
Write-Host "✓ Test 4: Add Email to User" -ForegroundColor Green
$emailData = @{
    from = "john@example.com"
    subject = "Project Update"
    content = "Hi, just wanted to update you on the project status..."
    category = "important"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$BASE_URL/test/user/$USER_ID/email" -Method Post -Body $emailData -ContentType "application/json"
$response | ConvertTo-Json
Write-Host ""

# Test 5: Add Spam Email
Write-Host "✓ Test 5: Add Spam Email" -ForegroundColor Green
$spamData = @{
    from = "spam@spammer.com"
    subject = "GET FREE MONEY NOW!!!"
    content = "Click here to claim your prize!!!"
    category = "spam"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$BASE_URL/test/user/$USER_ID/email" -Method Post -Body $spamData -ContentType "application/json"
$response | ConvertTo-Json
Write-Host ""

# Test 6: Get All Emails
Write-Host "✓ Test 6: Get All Emails" -ForegroundColor Green
$response = Invoke-RestMethod -Uri "$BASE_URL/test/user/$USER_ID/emails" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 7: Get User Stats
Write-Host "✓ Test 7: Get User Statistics" -ForegroundColor Green
$response = Invoke-RestMethod -Uri "$BASE_URL/test/user/$USER_ID/stats" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 8: Initialize Chat Session
Write-Host "✓ Test 8: Initialize Chat Session" -ForegroundColor Green
$sessionData = @{
    userId = $USER_ID
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$BASE_URL/test/chat/$SESSION_ID" -Method Post -Body $sessionData -ContentType "application/json"
$response | ConvertTo-Json
Write-Host ""

# Test 9: Add User Message
Write-Host "✓ Test 9: Add User Message to Chat" -ForegroundColor Green
$messageData = @{
    role = "user"
    content = "Show me important emails from today"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$BASE_URL/test/chat/$SESSION_ID/message" -Method Post -Body $messageData -ContentType "application/json"
$response | ConvertTo-Json
Write-Host ""

# Test 10: Add Assistant Response
Write-Host "✓ Test 10: Add Assistant Response" -ForegroundColor Green
$assistantData = @{
    role = "assistant"
    content = "I found 1 important email from John about the project update."
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$BASE_URL/test/chat/$SESSION_ID/message" -Method Post -Body $assistantData -ContentType "application/json"
$response | ConvertTo-Json
Write-Host ""

# Test 11: Get Chat History
Write-Host "✓ Test 11: Get Chat History" -ForegroundColor Green
$response = Invoke-RestMethod -Uri "$BASE_URL/test/chat/$SESSION_ID/history" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 12: Get Recent Messages
Write-Host "✓ Test 12: Get Recent Messages (limit 5)" -ForegroundColor Green
$response = Invoke-RestMethod -Uri "$BASE_URL/test/chat/$SESSION_ID/recent?limit=5" -Method Get
$response | ConvertTo-Json
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Phase 2 Tests Complete! ✅" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected Results:"
Write-Host "  ✓ User state created and retrieved"
Write-Host "  ✓ Emails stored and accessible"
Write-Host "  ✓ User statistics calculated correctly"
Write-Host "  ✓ Chat session initialized"
Write-Host "  ✓ Messages stored and retrieved"
Write-Host ""
Write-Host "If all tests passed, Phase 2 is complete!" -ForegroundColor Green
Write-Host "Ready to move to Phase 3: LLM Integration" -ForegroundColor Yellow

