import { DurableObject } from "cloudflare:workers";
import { UserState } from "./durable-objects/UserState.js";
import { ChatSession } from "./durable-objects/ChatSession.js";
import { summarizeEmail, classifyEmail, generateChatResponse } from "./services/llm.js";
import { processEmail } from "./services/email-processor.js";
import { registerUser, loginUser, verifySession, getSessionToken } from "./services/auth.js";
import { requireAuth } from "./middleware/auth.js";
import { getGmailAuthUrl, exchangeGmailCode, storeEmailProvider, getEmailProvider, fetchGmailMessages, getGmailMessage } from "./services/email-oauth.js";

/**
 * AI Email Helper Worker
 * 
 * Handles email processing, chat interactions, and state management
 */

// Export Durable Objects so Cloudflare can use them
export { UserState, ChatSession };

/**
 * Get CORS headers for the request
 * When credentials are needed, origin must be specific (not *)
 */
function getCorsHeaders(request) {
	const origin = request.headers.get('Origin') || 'http://localhost:5173';
	
	// Allow localhost on common ports for development
	const allowedOrigins = [
		'http://localhost:5173',
		'http://localhost:3000',
		'http://localhost:8787',
		'http://127.0.0.1:5173',
	];
	
	// In production, add your production domain here
	const isAllowed = allowedOrigins.includes(origin);
	
	return {
		'Access-Control-Allow-Origin': isAllowed ? origin : 'http://localhost:5173',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Allow-Credentials': 'true',
	};
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function handleOptions(request) {
	return new Response(null, {
		status: 204,
		headers: getCorsHeaders(request)
	});
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data, status = 200, request = null) {
	const corsHeaders = request ? getCorsHeaders(request) : {
		'Access-Control-Allow-Origin': 'http://localhost:5173',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Allow-Credentials': 'true',
	};
	
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders
		}
	});
}

export default {
	/**
	 * Email handler - receives emails from Cloudflare Email Routing
	 */
	async email(message, env, ctx) {
		try {
			console.log('Email received:', message.from, '->', message.to);
			
			// Extract email data
			const emailData = {
				from: message.from,
				to: message.to,
				subject: message.headers.get('subject') || '(No subject)',
				content: await message.raw(),
				headers: {
					messageId: message.headers.get('message-id') || '',
					date: message.headers.get('date') || new Date().toISOString(),
					contentType: message.headers.get('content-type') || 'text/plain'
				},
				rawSize: message.rawSize || 0
			};

			// Process email with AI
			const processed = await processEmail(env.AI, emailData);
			
			// Determine user from email address (in real app, would have email-to-user mapping)
			const userId = emailData.to.split('@')[0] || 'default';
			
			// Store in user's state
			const userStateId = env.USER_STATE.idFromName(userId);
			const userStub = env.USER_STATE.get(userStateId);
			await userStub.addEmail(processed);
			
			console.log(`Email processed and stored for user: ${userId}, category: ${processed.category}`);
			
			// Auto-forward non-spam emails (optional)
			if (!processed.classification.shouldFilter) {
				await message.forward(emailData.to);
			}
			
		} catch (error) {
			console.error('Error processing email:', error);
			// Forward anyway to prevent email loss
			await message.forward(message.to);
		}
	},

	/**
	 * Scheduled handler - runs daily tasks
	 */
	async scheduled(event, env, ctx) {
		try {
			console.log('Running scheduled task:', event.cron);
			
			// Generate daily digest for all users
			// In a real app, you'd iterate through user list
			const testUserId = 'testuser';
			const userStateId = env.USER_STATE.idFromName(testUserId);
			const userStub = env.USER_STATE.get(userStateId);
			
			// Get unread important emails
			const emails = await userStub.getEmails({ category: 'important', unreadOnly: true });
			
			if (emails.length > 0) {
				console.log(`Daily digest: ${emails.length} unread important emails for ${testUserId}`);
				// In real app, send notification or email digest here
			}
			
		} catch (error) {
			console.error('Error in scheduled task:', error);
		}
	},

	/**
	 * HTTP handler - API endpoints
	 */
	async fetch(request, env, ctx) {
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
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

		// Test: Get Emails (specific routes BEFORE general user state)
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

		// Test: Get User State (general route, check LAST)
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

			// ==================== EMAIL WORKFLOW TESTS ====================
			
			// Test: Simulate Email Reception
			if (path === '/test/simulate-email' && request.method === 'POST') {
				const { to, from, subject, content } = await request.json();
				
				if (!from || !content) {
					return jsonResponse({
						error: 'Bad Request',
						message: 'from and content are required'
					}, 400);
				}

				// Simulate email processing
				const emailData = {
					from,
					to: to || 'inbox@test.com',
					subject: subject || '(No subject)',
					content
				};

				const processed = await processEmail(env.AI, emailData);
				const userId = emailData.to.split('@')[0] || 'testuser';
				
				const userStateId = env.USER_STATE.idFromName(userId);
				const userStub = env.USER_STATE.get(userStateId);
				const stored = await userStub.addEmail(processed);

				return jsonResponse({
					success: true,
					message: 'Email simulated and processed',
					userId,
					email: stored
				});
			}

			// Test: Trigger Daily Digest
			if (path === '/test/daily-digest' && request.method === 'POST') {
				const { userId = 'testuser' } = await request.json();
				
				const userStateId = env.USER_STATE.idFromName(userId);
				const userStub = env.USER_STATE.get(userStateId);
				
				const unreadImportant = await userStub.getEmails({ 
					category: 'important', 
					unreadOnly: true 
				});
				
				const stats = await userStub.getStats();

				return jsonResponse({
					success: true,
					digest: {
						userId,
						unreadImportant: unreadImportant.length,
						emails: unreadImportant,
						stats
					}
				});
			}

			// ==================== AUTHENTICATION API ====================
			
			// API: Register
			if (path === '/api/auth/register' && request.method === 'POST') {
				const { email, password, name } = await request.json();
				
				if (!email || !password) {
					return jsonResponse({
						success: false,
						error: 'Email and password are required'
					}, 400, request);
				}

				const result = await registerUser(env, email, password, name);
				
				if (!result.success) {
					return jsonResponse(result, 400, request);
				}

				// Set cookie
				const response = jsonResponse({
					success: true,
					user: result.user
				}, 200, request);
				
				response.headers.set('Set-Cookie', `session=${result.sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);
				
				return response;
			}

			// API: Login
			if (path === '/api/auth/login' && request.method === 'POST') {
				const { email, password } = await request.json();
				
				if (!email || !password) {
					return jsonResponse({
						success: false,
						error: 'Email and password are required'
					}, 400, request);
				}

				const result = await loginUser(env, email, password);
				
				if (!result.success) {
					return jsonResponse(result, 401, request);
				}

				// Set cookie
				const response = jsonResponse({
					success: true,
					user: result.user
				}, 200, request);
				
				response.headers.set('Set-Cookie', `session=${result.sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);
				
				return response;
			}

			// API: Get Current User
			if (path === '/api/auth/me' && request.method === 'GET') {
				const sessionToken = getSessionToken(request);
				
				if (!sessionToken) {
					return jsonResponse({
						success: false,
						error: 'Not authenticated'
					}, 401, request);
				}

				const verification = await verifySession(env, sessionToken);
				
				if (!verification.valid) {
					return jsonResponse({
						success: false,
						error: verification.error
					}, 401, request);
				}

				return jsonResponse({
					success: true,
					user: verification.user
				}, 200, request);
			}

			// API: Logout
			if (path === '/api/auth/logout' && request.method === 'POST') {
				const response = jsonResponse({
					success: true,
					message: 'Logged out successfully'
				}, 200, request);
				
				// Clear cookie
				response.headers.set('Set-Cookie', `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
				
				return response;
			}

			// ==================== EMAIL PROVIDER OAUTH ====================

			// API: Start Gmail OAuth
			if (path === '/api/oauth/gmail/start' && request.method === 'GET') {
				const sessionToken = getSessionToken(request);
				
				if (!sessionToken) {
					return jsonResponse({
						success: false,
						error: 'Not authenticated'
					}, 401);
				}

				const verification = await verifySession(env, sessionToken);
				if (!verification.valid) {
					return jsonResponse({
						success: false,
						error: 'Invalid session'
					}, 401);
				}

				// Generate state token with user ID
				const state = btoa(JSON.stringify({
					userId: verification.user.id,
					timestamp: Date.now()
				}));

				const authUrl = getGmailAuthUrl(state, env);

				return jsonResponse({
					success: true,
					authUrl
				});
			}

			// API: Gmail OAuth Callback
			if (path === '/api/oauth/gmail/callback' && request.method === 'GET') {
				const url = new URL(request.url);
				const code = url.searchParams.get('code');
				const state = url.searchParams.get('state');

				if (!code || !state) {
					return jsonResponse({
						success: false,
						error: 'Missing code or state'
					}, 400);
				}

				try {
					// Decode state to get user ID
					const stateData = JSON.parse(atob(state));
					const userId = stateData.userId;

					// Exchange code for tokens
					const tokenResult = await exchangeGmailCode(code, env);
					
					if (!tokenResult.success) {
						return jsonResponse({
							success: false,
							error: tokenResult.error
						}, 400);
					}

					// Store credentials
					await storeEmailProvider(env, userId, 'gmail', {
						email: userId, // In production, fetch from Gmail API
						accessToken: tokenResult.accessToken,
						refreshToken: tokenResult.refreshToken,
						expiresIn: tokenResult.expiresIn
					});

					// Redirect to frontend with success
					return Response.redirect(`${url.origin}/settings?oauth=success`, 302);
				} catch (error) {
					console.error('OAuth callback error:', error);
					return jsonResponse({
						success: false,
						error: 'OAuth callback failed'
					}, 500);
				}
			}

			// API: Get Connected Providers
			if (path === '/api/email-providers' && request.method === 'GET') {
				const sessionToken = getSessionToken(request);
				
				if (!sessionToken) {
					return jsonResponse({
						success: false,
						error: 'Not authenticated'
					}, 401);
				}

				const verification = await verifySession(env, sessionToken);
				if (!verification.valid) {
					return jsonResponse({
						success: false,
						error: 'Invalid session'
					}, 401);
				}

				// Get user state
				const id = env.USER_STATE.idFromName(verification.user.id);
				const userState = env.USER_STATE.get(id);
				const response = await userState.fetch('http://internal/get');
				const data = await response.json();

				const providers = data.state?.user?.emailProviders || [];

				return jsonResponse({
					success: true,
					providers: providers.map(p => ({
						provider: p.provider,
						email: p.email,
						connectedAt: p.connectedAt
					}))
				});
			}

			// API: Sync Gmail
			if (path === '/api/email-providers/gmail/sync' && request.method === 'POST') {
				const sessionToken = getSessionToken(request);
				
				if (!sessionToken) {
					return jsonResponse({
						success: false,
						error: 'Not authenticated'
					}, 401);
				}

				const verification = await verifySession(env, sessionToken);
				if (!verification.valid) {
					return jsonResponse({
						success: false,
						error: 'Invalid session'
					}, 401);
				}

				// Get Gmail credentials
				const providerResult = await getEmailProvider(env, verification.user.id, 'gmail');
				
				if (!providerResult.success) {
					return jsonResponse({
						success: false,
						error: 'Gmail not connected'
					}, 400);
				}

				// Fetch messages
				const messagesResult = await fetchGmailMessages(providerResult.provider.accessToken, {
					maxResults: 20
				});

				if (!messagesResult.success) {
					return jsonResponse({
						success: false,
						error: messagesResult.error
					}, 500);
				}

				// Process each message
				const processed = [];
				for (const msg of messagesResult.messages.slice(0, 5)) { // Process first 5
					const messageResult = await getGmailMessage(providerResult.provider.accessToken, msg.id);
					
					if (messageResult.success) {
						// Process with AI
						const processedEmail = await processEmail(env.AI, messageResult.email);
						
						// Store in user's state
						const userStateId = env.USER_STATE.idFromName(verification.user.id);
						const userStub = env.USER_STATE.get(userStateId);
						await userStub.addEmail(processedEmail);
						
						processed.push(processedEmail);
					}
				}

				return jsonResponse({
					success: true,
					synced: processed.length,
					emails: processed
				});
			}

			// ==================== INTEGRATED API ====================
			
			// API: Chat (with email context and history) - Protected
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
					workflow: {
						simulateEmail: 'POST /test/simulate-email',
						dailyDigest: 'POST /test/daily-digest'
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
