/**
 * API Client for Email Helper Backend
 */

const API_BASE = 'http://localhost:8787';

/**
 * Fetch emails for a user
 */
export async function getEmails(userId = 'testuser') {
  const response = await fetch(`${API_BASE}/test/user/${userId}/emails`);
  if (!response.ok) throw new Error('Failed to fetch emails');
  return response.json();
}

/**
 * Get user email statistics
 */
export async function getEmailStats(userId = 'testuser') {
  const response = await fetch(`${API_BASE}/test/user/${userId}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

/**
 * Send a chat message to AI
 */
export async function sendChatMessage(userId, sessionId, message) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      sessionId,
      message,
    }),
  });
  
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

/**
 * Simulate an email (for testing)
 */
export async function simulateEmail(from, subject, content, to = 'testuser@test.com') {
  const response = await fetch(`${API_BASE}/test/simulate-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      content,
    }),
  });
  
  if (!response.ok) throw new Error('Failed to simulate email');
  return response.json();
}

/**
 * Initialize chat session
 */
export async function initChatSession(sessionId, userId) {
  const response = await fetch(`${API_BASE}/test/chat/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  
  if (!response.ok) throw new Error('Failed to initialize session');
  return response.json();
}

/**
 * Get chat history
 */
export async function getChatHistory(sessionId) {
  const response = await fetch(`${API_BASE}/test/chat/${sessionId}/history`);
  if (!response.ok) throw new Error('Failed to fetch chat history');
  return response.json();
}

