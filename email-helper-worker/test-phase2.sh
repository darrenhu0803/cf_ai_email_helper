#!/bin/bash

# Phase 2 Test Script: Durable Objects
# Tests UserState and ChatSession functionality

BASE_URL="http://localhost:8787"
USER_ID="test123"
SESSION_ID="session_abc"

echo "=========================================="
echo "  Phase 2: Testing Durable Objects"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "✓ Test 1: Health Check"
curl -s "$BASE_URL/health" | jq .
echo ""
echo ""

# Test 2: Create User
echo "✓ Test 2: Create User State"
curl -s -X POST "$BASE_URL/test/user/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"preferences":{"filterSpam":true}}' | jq .
echo ""
echo ""

# Test 3: Get User State
echo "✓ Test 3: Get User State"
curl -s "$BASE_URL/test/user/$USER_ID" | jq .
echo ""
echo ""

# Test 4: Add Email
echo "✓ Test 4: Add Email to User"
curl -s -X POST "$BASE_URL/test/user/$USER_ID/email" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "john@example.com",
    "subject": "Project Update",
    "content": "Hi, just wanted to update you on the project status...",
    "category": "important"
  }' | jq .
echo ""
echo ""

# Test 5: Add Another Email (Spam)
echo "✓ Test 5: Add Spam Email"
curl -s -X POST "$BASE_URL/test/user/$USER_ID/email" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "spam@spammer.com",
    "subject": "GET FREE MONEY NOW!!!",
    "content": "Click here to claim your prize!!!",
    "category": "spam"
  }' | jq .
echo ""
echo ""

# Test 6: Get All Emails
echo "✓ Test 6: Get All Emails"
curl -s "$BASE_URL/test/user/$USER_ID/emails" | jq .
echo ""
echo ""

# Test 7: Get User Stats
echo "✓ Test 7: Get User Statistics"
curl -s "$BASE_URL/test/user/$USER_ID/stats" | jq .
echo ""
echo ""

# Test 8: Initialize Chat Session
echo "✓ Test 8: Initialize Chat Session"
curl -s -X POST "$BASE_URL/test/chat/$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\"}" | jq .
echo ""
echo ""

# Test 9: Add User Message
echo "✓ Test 9: Add User Message to Chat"
curl -s -X POST "$BASE_URL/test/chat/$SESSION_ID/message" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "Show me important emails from today"
  }' | jq .
echo ""
echo ""

# Test 10: Add Assistant Response
echo "✓ Test 10: Add Assistant Response"
curl -s -X POST "$BASE_URL/test/chat/$SESSION_ID/message" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "assistant",
    "content": "I found 1 important email from John about the project update."
  }' | jq .
echo ""
echo ""

# Test 11: Get Chat History
echo "✓ Test 11: Get Chat History"
curl -s "$BASE_URL/test/chat/$SESSION_ID/history" | jq .
echo ""
echo ""

# Test 12: Get Recent Messages
echo "✓ Test 12: Get Recent Messages (limit 5)"
curl -s "$BASE_URL/test/chat/$SESSION_ID/recent?limit=5" | jq .
echo ""
echo ""

echo "=========================================="
echo "  Phase 2 Tests Complete! ✅"
echo "=========================================="
echo ""
echo "Expected Results:"
echo "  ✓ User state created and retrieved"
echo "  ✓ Emails stored and accessible"
echo "  ✓ User statistics calculated correctly"
echo "  ✓ Chat session initialized"
echo "  ✓ Messages stored and retrieved"
echo ""
echo "If all tests passed, Phase 2 is complete!"
echo "Ready to move to Phase 3: LLM Integration"

