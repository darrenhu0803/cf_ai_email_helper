import { DurableObject } from "cloudflare:workers";
import { UserState } from "./durable-objects/UserState.js";
import { ChatSession } from "./durable-objects/ChatSession.js";
import { summarizeEmail, classifyEmail, generateChatResponse } from "./services/llm.js";
import { processEmail } from "./services/email-processor.js";

/**
 * AI Email Helper Worker
 * 
 * Handles email processing, chat interactions, and state management
 */

// Export Durable Objects so Cloudflare can use them
export { UserState, ChatSession };

/**
 * CORS headers for frontend communication
 */
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function handleOptions() {
	return new Response(null, {
		status: 204,
		headers: corsHeaders
	});
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders
		}
	});
}

export default {
	async fetch(request, env, ctx) {
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return handleOptions();
		}

		const url = new URL(request.url);
		const path = url.pathname;

		try {
			// ==================== HEALTH CHECK ====================
			if (path === '/' || path === '/health') {
				return jsonResponse({
					status: 'healthy',
					message: 'AI Email Helper Worker is running!',
					timestamp: new Date().toISOString()
				});
			}

			// ==================== USER STATE TESTS ====================
			
			// Test: Create/Update User
			if (path.startsWith('/test/user/') && request.method === 'POST') {
				const userId = path.split('/').pop();
				const data = await request.json();
				
				const id = env.USER_STATE.idFromName(userId);
				const stub = env.USER_STATE.get(id);
				
				const result = await stub.setUser({ userId, ...data });
				
				return jsonResponse({
					success: true,
					message: 'User state created/updated',
					data: result
				});
			}

			// Test: Get User State
			if (path.startsWith('/test/user/') && request.method === 'GET') {
				const userId = path.split('/').pop();
				
				const id = env.USER_STATE.idFromName(userId);
				const stub = env.USER_STATE.get(id);
				
				const state = await stub.getState();
				
				return jsonResponse({
					success: true,
					data: state
				});
			}

			// Test: Add Email
			if (path.startsWith('/test/user/') && path.includes('/email') && request.method === 'POST') {
				const userId = path.split('/')[3];
				const emailData = await request.json();
				
				const id = env.USER_STATE.idFromName(userId);
				const stub = env.USER_STATE.get(id);
				
				const email = await stub.addEmail(emailData);
				
				return jsonResponse({
					success: true,
					message: 'Email added',
					data: email
				});
			}

			// Test: Get Emails
			if (path.startsWith('/test/user/') && path.includes('/emails') && request.method === 'GET') {
				const userId = path.split('/')[3];
				
				const id = env.USER_STATE.idFromName(userId);
				const stub = env.USER_STATE.get(id);
				
				const emails = await stub.getEmails();
				
				return jsonResponse({
					success: true,
					count: emails.length,
					data: emails
				});
			}

			// Test: Get User Stats
			if (path.startsWith('/test/user/') && path.includes('/stats') && request.method === 'GET') {
				const userId = path.split('/')[3];
				
				const id = env.USER_STATE.idFromName(userId);
				const stub = env.USER_STATE.get(id);
				
				const stats = await stub.getStats();
				
				return jsonResponse({
					success: true,
					data: stats
				});
			}

			// ==================== CHAT SESSION TESTS ====================
			
			// Test: Initialize Chat Session
			if (path.startsWith('/test/chat/') && request.method === 'POST' && !path.includes('/message')) {
				const sessionId = path.split('/')[3];
				const data = await request.json();
				
				const id = env.CHAT_SESSION.idFromName(sessionId);
				const stub = env.CHAT_SESSION.get(id);
				
				const session = await stub.initSession({ sessionId, ...data });
				
				return jsonResponse({
					success: true,
					message: 'Chat session initialized',
					data: session
				});
			}

			// Test: Add Message to Chat
			if (path.includes('/message') && request.method === 'POST') {
				const sessionId = path.split('/')[3];
				const message = await request.json();
				
				const id = env.CHAT_SESSION.idFromName(sessionId);
				const stub = env.CHAT_SESSION.get(id);
				
				const addedMessage = await stub.addMessage(message);
				
				return jsonResponse({
					success: true,
					message: 'Message added',
					data: addedMessage
				});
			}

			// Test: Get Chat History
			if (path.startsWith('/test/chat/') && path.includes('/history') && request.method === 'GET') {
				const sessionId = path.split('/')[3];
				
				const id = env.CHAT_SESSION.idFromName(sessionId);
				const stub = env.CHAT_SESSION.get(id);
				
				const session = await stub.getSession();
				
				return jsonResponse({
					success: true,
					data: session
				});
			}

			// Test: Get Recent Messages
			if (path.startsWith('/test/chat/') && path.includes('/recent') && request.method === 'GET') {
				const sessionId = path.split('/')[3];
				const limit = parseInt(url.searchParams.get('limit')) || 10;
				
				const id = env.CHAT_SESSION.idFromName(sessionId);
				const stub = env.CHAT_SESSION.get(id);
				
				const messages = await stub.getRecentMessages(limit);
				
				return jsonResponse({
					success: true,
					count: messages.length,
					data: messages
				});
			}

			// ==================== LLM / AI TESTS ====================
			
			// Test: Summarize Email
			if (path === '/test/summarize' && request.method === 'POST') {
				const { emailContent, from, subject } = await request.json();
				
				if (!emailContent) {
					return jsonResponse({
						error: 'Bad Request',
						message: 'emailContent is required'
					}, 400);
				}
				
				const summary = await summarizeEmail(env.AI, emailContent, { from, subject });
				
				return jsonResponse({
					success: true,
					summary,
					metadata: { from, subject }
				});
			}

			// Test: Classify Email
			if (path === '/test/classify' && request.method === 'POST') {
				const { emailContent, from, subject } = await request.json();
				
				if (!emailContent) {
					return jsonResponse({
						error: 'Bad Request',
						message: 'emailContent is required'
					}, 400);
				}
				
				const classification = await classifyEmail(env.AI, emailContent, { from, subject });
				
				return jsonResponse({
					success: true,
					classification
				});
			}

			// Test: Process Full Email
			if (path === '/test/process-email' && request.method === 'POST') {
				const rawEmail = await request.json();
				
				const processed = await processEmail(env.AI, rawEmail);
				
				return jsonResponse({
					success: true,
					email: processed
				});
			}

			// Test: Chat with AI
			if (path === '/test/ai-chat' && request.method === 'POST') {
				const { message, emails = [], chatHistory = [] } = await request.json();
				
				if (!message) {
					return jsonResponse({
						error: 'Bad Request',
						message: 'message is required'
					}, 400);
				}
				
				const response = await generateChatResponse(env.AI, message, emails, chatHistory);
				
				return jsonResponse({
					success: true,
					response
				});
			}

			// ==================== INTEGRATED API ====================
			
			// API: Chat (with email context and history)
			if (path === '/api/chat' && request.method === 'POST') {
				const { message, userId, sessionId } = await request.json();
				
				if (!message || !userId || !sessionId) {
					return jsonResponse({
						error: 'Bad Request',
						message: 'message, userId, and sessionId are required'
					}, 400);
				}

				// Get user's recent emails
				const userStateId = env.USER_STATE.idFromName(userId);
				const userStub = env.USER_STATE.get(userStateId);
				const emails = await userStub.getEmails({ limit: 10 });

				// Get chat history
				const chatSessionId = env.CHAT_SESSION.idFromName(sessionId);
				const chatStub = env.CHAT_SESSION.get(chatSessionId);
				const history = await chatStub.getRecentMessages(5);

				// Generate AI response
				const aiResponse = await generateChatResponse(env.AI, message, emails, history);

				// Store messages
				await chatStub.addMessage({ role: 'user', content: message });
				await chatStub.addMessage({ role: 'assistant', content: aiResponse });

				return jsonResponse({
					success: true,
					response: aiResponse,
					context: {
						emailCount: emails.length,
						historyCount: history.length
					}
				});
			}

			// API: Process and Store Email
			if (path === '/api/email/process' && request.method === 'POST') {
				const { userId, rawEmail } = await request.json();
				
				if (!userId || !rawEmail) {
					return jsonResponse({
						error: 'Bad Request',
						message: 'userId and rawEmail are required'
					}, 400);
				}

				// Process email with AI
				const processed = await processEmail(env.AI, rawEmail);

				// Store in user's state
				const userStateId = env.USER_STATE.idFromName(userId);
				const userStub = env.USER_STATE.get(userStateId);
				const stored = await userStub.addEmail(processed);

				return jsonResponse({
					success: true,
					email: stored
				});
			}

			// Default 404
			return jsonResponse({
				error: 'Not Found',
				message: `Endpoint ${path} not found`,
				availableEndpoints: {
					health: 'GET /',
					llm: {
						summarize: 'POST /test/summarize',
						classify: 'POST /test/classify',
						processEmail: 'POST /test/process-email',
						aiChat: 'POST /test/ai-chat'
					},
					userState: {
						create: 'POST /test/user/{userId}',
						get: 'GET /test/user/{userId}',
						addEmail: 'POST /test/user/{userId}/email',
						getEmails: 'GET /test/user/{userId}/emails',
						getStats: 'GET /test/user/{userId}/stats'
					},
					chatSession: {
						init: 'POST /test/chat/{sessionId}',
						addMessage: 'POST /test/chat/{sessionId}/message',
						getHistory: 'GET /test/chat/{sessionId}/history',
						getRecent: 'GET /test/chat/{sessionId}/recent'
					},
					api: {
						chat: 'POST /api/chat',
						processEmail: 'POST /api/email/process'
					}
				}
			}, 404);

		} catch (error) {
			return jsonResponse({
				error: 'Internal Server Error',
				message: error.message,
				stack: error.stack
			}, 500);
		}
	},
};
