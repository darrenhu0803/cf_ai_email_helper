/**
 * API Client for Email Helper
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

/**
 * Send a chat message
 */
export async function sendChatMessage(message, userId = 'demo', sessionId = 'session1') {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, userId, sessionId })
  });
  
  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get user's emails
 */
export async function getEmails(userId = 'demo') {
  const response = await fetch(`${API_BASE}/test/user/${userId}/emails`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch emails: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get email statistics
 */
export async function getEmailStats(userId = 'demo') {
  const response = await fetch(`${API_BASE}/test/user/${userId}/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Simulate email reception
 */
export async function simulateEmail(emailData) {
  const response = await fetch(`${API_BASE}/test/simulate-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to simulate email: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Initialize chat session
 */
export async function initChatSession(userId = 'demo', sessionId = 'session1') {
  const response = await fetch(`${API_BASE}/test/chat/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to init session: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get chat history
 */
export async function getChatHistory(sessionId = 'session1') {
  const response = await fetch(`${API_BASE}/test/chat/${sessionId}/history`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }
  
  return response.json();
}

