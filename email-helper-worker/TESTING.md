# Testing Guide - Email Helper Worker

## Phase 2: Durable Objects Testing

### Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```
   
   The worker should be running at `http://localhost:8787`

### Running Tests

#### Option 1: Automated Test Script (Recommended)

**Windows (PowerShell):**
```powershell
.\test-phase2.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x test-phase2.sh
./test-phase2.sh
```

#### Option 2: Manual Testing with curl

##### 1. Health Check
```bash
curl http://localhost:8787/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "message": "AI Email Helper Worker is running!",
  "timestamp": "2025-10-19T..."
}
```

##### 2. Create User State
```bash
curl -X POST http://localhost:8787/test/user/test123 \
  -H "Content-Type: application/json" \
  -d '{"preferences":{"filterSpam":true}}'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "User state created/updated",
  "data": {
    "userId": "test123",
    "emails": [],
    "preferences": {
      "filterSpam": true,
      "autoSummarize": true,
      "notificationsEnabled": true
    },
    "createdAt": "2025-10-19T..."
  }
}
```

##### 3. Get User State
```bash
curl http://localhost:8787/test/user/test123
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "userId": "test123",
    "emails": [],
    "preferences": {...},
    "createdAt": "..."
  }
}
```

##### 4. Add Email
```bash
curl -X POST http://localhost:8787/test/user/test123/email \
  -H "Content-Type: application/json" \
  -d '{
    "from": "john@example.com",
    "subject": "Project Update",
    "content": "Hi, just wanted to update you on the project...",
    "category": "important"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Email added",
  "data": {
    "id": "email_...",
    "from": "john@example.com",
    "subject": "Project Update",
    "category": "important",
    "receivedAt": "2025-10-19T..."
  }
}
```

##### 5. Get All Emails
```bash
curl http://localhost:8787/test/user/test123/emails
```

**Expected Output:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "email_...",
      "from": "john@example.com",
      "subject": "Project Update",
      ...
    }
  ]
}
```

##### 6. Get User Statistics
```bash
curl http://localhost:8787/test/user/test123/stats
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "unread": 2,
    "byCategory": {
      "important": 1,
      "spam": 1,
      "newsletter": 0,
      "other": 0
    }
  }
}
```

##### 7. Initialize Chat Session
```bash
curl -X POST http://localhost:8787/test/chat/session_abc \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123"}'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Chat session initialized",
  "data": {
    "sessionId": "session_abc",
    "userId": "test123",
    "messages": [],
    "createdAt": "2025-10-19T...",
    "messageCount": 0
  }
}
```

##### 8. Add Message to Chat
```bash
curl -X POST http://localhost:8787/test/chat/session_abc/message \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "Show me important emails from today"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Message added",
  "data": {
    "id": "msg_...",
    "role": "user",
    "content": "Show me important emails from today",
    "timestamp": "2025-10-19T...",
    "metadata": {}
  }
}
```

##### 9. Get Chat History
```bash
curl http://localhost:8787/test/chat/session_abc/history
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_abc",
    "userId": "test123",
    "messages": [
      {
        "id": "msg_...",
        "role": "user",
        "content": "Show me important emails from today",
        "timestamp": "..."
      }
    ],
    "messageCount": 1
  }
}
```

##### 10. Get Recent Messages
```bash
curl "http://localhost:8787/test/chat/session_abc/recent?limit=5"
```

**Expected Output:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "msg_...",
      "role": "user",
      "content": "Show me important emails from today",
      ...
    }
  ]
}
```

---

## Success Criteria

✅ **Phase 2 Complete When:**

1. ✅ User state can be created and retrieved
2. ✅ Emails can be stored and accessed
3. ✅ User statistics are calculated correctly
4. ✅ Chat sessions can be initialized
5. ✅ Messages are stored and retrieved properly
6. ✅ Data persists across requests (same user ID returns same data)

---

## Troubleshooting

### Worker not responding
```bash
# Check if worker is running
curl http://localhost:8787/health

# If not running, start it:
npm run dev
```

### "Durable Object not found" error
- Make sure you saved wrangler.jsonc changes
- Restart the dev server: `Ctrl+C` then `npm run dev`

### "Module not found" error
- Check that all files are in correct locations:
  - `src/index.js`
  - `src/durable-objects/UserState.js`
  - `src/durable-objects/ChatSession.js`

### Data not persisting
- Durable Objects use SQLite storage in dev mode
- Data persists in `.wrangler/state/` folder
- To reset: stop server, delete `.wrangler/` folder, restart

---

## Available API Endpoints

### Health
- `GET /` or `GET /health` - Check worker status

### User State
- `POST /test/user/{userId}` - Create/update user
- `GET /test/user/{userId}` - Get user state
- `POST /test/user/{userId}/email` - Add email
- `GET /test/user/{userId}/emails` - Get all emails
- `GET /test/user/{userId}/stats` - Get statistics

### Chat Session
- `POST /test/chat/{sessionId}` - Initialize session
- `POST /test/chat/{sessionId}/message` - Add message
- `GET /test/chat/{sessionId}/history` - Get full history
- `GET /test/chat/{sessionId}/recent?limit=N` - Get recent messages

---

## Next Steps

Once all Phase 2 tests pass:
1. ✅ Commit your changes
2. 🎯 Move to **Phase 3: LLM Integration**
   - Add Workers AI binding
   - Implement email summarization
   - Add email classification
   - Implement chat AI responses

---

**Phase 2 Status:** ⏳ In Progress

Run the tests above to verify completion!

