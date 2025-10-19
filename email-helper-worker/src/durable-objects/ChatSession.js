import { DurableObject } from "cloudflare:workers";

/**
 * ChatSession Durable Object
 * Stores conversation history and context for chat interactions
 */
export class ChatSession extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
	}

	/**
	 * Get full chat session data
	 * @returns {Promise<Object>} Session data with messages
	 */
	async getSession() {
		const messages = await this.ctx.storage.get('messages') || [];
		const sessionId = await this.ctx.storage.get('sessionId');
		const userId = await this.ctx.storage.get('userId');
		const createdAt = await this.ctx.storage.get('createdAt');

		return {
			sessionId,
			userId,
			messages,
			createdAt,
			messageCount: messages.length
		};
	}

	/**
	 * Initialize a new chat session
	 * @param {Object} data - Session initialization data
	 * @returns {Promise<Object>} Created session
	 */
	async initSession(data) {
		const { sessionId, userId } = data;
		
		await this.ctx.storage.put('sessionId', sessionId);
		await this.ctx.storage.put('userId', userId);
		await this.ctx.storage.put('createdAt', new Date().toISOString());
		await this.ctx.storage.put('messages', []);

		return await this.getSession();
	}

	/**
	 * Add a message to the chat history
	 * @param {Object} message - Message object
	 * @returns {Promise<Object>} Added message with metadata
	 */
	async addMessage(message) {
		const messages = await this.ctx.storage.get('messages') || [];
		
		const newMessage = {
			id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			role: message.role, // 'user' or 'assistant'
			content: message.content,
			timestamp: new Date().toISOString(),
			metadata: message.metadata || {} // For storing email references, etc.
		};

		messages.push(newMessage);
		
		// Keep only last 100 messages to avoid excessive storage
		if (messages.length > 100) {
			messages.splice(0, messages.length - 100);
		}

		await this.ctx.storage.put('messages', messages);
		await this.ctx.storage.put('lastActivity', new Date().toISOString());
		
		return newMessage;
	}

	/**
	 * Get recent messages for context
	 * @param {number} limit - Number of recent messages to retrieve
	 * @returns {Promise<Array>} Recent messages
	 */
	async getRecentMessages(limit = 10) {
		const messages = await this.ctx.storage.get('messages') || [];
		return messages.slice(-limit);
	}

	/**
	 * Get messages with pagination
	 * @param {Object} options - Pagination options
	 * @returns {Promise<Object>} Paginated messages
	 */
	async getMessages(options = {}) {
		const messages = await this.ctx.storage.get('messages') || [];
		const { offset = 0, limit = 50 } = options;

		const paginated = messages.slice(offset, offset + limit);

		return {
			messages: paginated,
			total: messages.length,
			offset,
			limit
		};
	}

	/**
	 * Search messages by content
	 * @param {string} query - Search query
	 * @returns {Promise<Array>} Matching messages
	 */
	async searchMessages(query) {
		const messages = await this.ctx.storage.get('messages') || [];
		const lowerQuery = query.toLowerCase();

		return messages.filter(msg => 
			msg.content.toLowerCase().includes(lowerQuery)
		);
	}

	/**
	 * Get conversation context for AI
	 * Returns recent messages formatted for LLM input
	 * @param {number} messageCount - Number of recent messages
	 * @returns {Promise<Array>} Formatted messages for LLM
	 */
	async getContext(messageCount = 5) {
		const messages = await this.ctx.storage.get('messages') || [];
		const recent = messages.slice(-messageCount);

		return recent.map(msg => ({
			role: msg.role,
			content: msg.content
		}));
	}

	/**
	 * Clear chat history
	 * @returns {Promise<void>}
	 */
	async clearHistory() {
		await this.ctx.storage.put('messages', []);
		await this.ctx.storage.put('lastActivity', new Date().toISOString());
	}

	/**
	 * Get session statistics
	 * @returns {Promise<Object>} Session stats
	 */
	async getStats() {
		const messages = await this.ctx.storage.get('messages') || [];
		const createdAt = await this.ctx.storage.get('createdAt');
		const lastActivity = await this.ctx.storage.get('lastActivity');

		return {
			totalMessages: messages.length,
			userMessages: messages.filter(m => m.role === 'user').length,
			assistantMessages: messages.filter(m => m.role === 'assistant').length,
			createdAt,
			lastActivity
		};
	}

	/**
	 * Update message (e.g., for editing or adding reactions)
	 * @param {string} messageId - Message ID
	 * @param {Object} updates - Fields to update
	 * @returns {Promise<Object|null>} Updated message or null if not found
	 */
	async updateMessage(messageId, updates) {
		const messages = await this.ctx.storage.get('messages') || [];
		const messageIndex = messages.findIndex(m => m.id === messageId);

		if (messageIndex !== -1) {
			messages[messageIndex] = {
				...messages[messageIndex],
				...updates,
				updatedAt: new Date().toISOString()
			};

			await this.ctx.storage.put('messages', messages);
			return messages[messageIndex];
		}

		return null;
	}

	/**
	 * Delete a specific message
	 * @param {string} messageId - Message ID to delete
	 * @returns {Promise<boolean>} Success status
	 */
	async deleteMessage(messageId) {
		const messages = await this.ctx.storage.get('messages') || [];
		const filtered = messages.filter(m => m.id !== messageId);

		if (filtered.length < messages.length) {
			await this.ctx.storage.put('messages', filtered);
			return true;
		}

		return false;
	}
}

