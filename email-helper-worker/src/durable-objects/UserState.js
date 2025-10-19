import { DurableObject } from "cloudflare:workers";

/**
 * UserState Durable Object
 * Stores user data, emails, summaries, and preferences
 */
export class UserState extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
	}

	/**
	 * Get user state including emails and preferences
	 * @returns {Promise<Object>} User state object
	 */
	async getState() {
		const emails = await this.ctx.storage.get('emails') || [];
		const preferences = await this.ctx.storage.get('preferences') || {
			filterSpam: true,
			autoSummarize: true,
			notificationsEnabled: true
		};
		const userId = await this.ctx.storage.get('userId');

		return {
			userId,
			emails,
			preferences,
			createdAt: await this.ctx.storage.get('createdAt')
		};
	}

	/**
	 * Initialize or update user
	 * @param {Object} data - User data
	 * @returns {Promise<Object>} Updated user state
	 */
	async setUser(data) {
		const { userId, preferences } = data;
		
		await this.ctx.storage.put('userId', userId);
		
		if (preferences) {
			await this.ctx.storage.put('preferences', preferences);
		}
		
		// Set created timestamp if not exists
		const createdAt = await this.ctx.storage.get('createdAt');
		if (!createdAt) {
			await this.ctx.storage.put('createdAt', new Date().toISOString());
		}

		return await this.getState();
	}

	/**
	 * Add an email to user's inbox
	 * @param {Object} email - Email object with content, summary, classification
	 * @returns {Promise<Object>} Added email with ID
	 */
	async addEmail(email) {
		const emails = await this.ctx.storage.get('emails') || [];
		
		const newEmail = {
			id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			...email,
			receivedAt: new Date().toISOString()
		};

		emails.unshift(newEmail); // Add to beginning (most recent first)
		
		// Keep only last 100 emails in memory
		if (emails.length > 100) {
			emails.splice(100);
		}

		await this.ctx.storage.put('emails', emails);
		
		return newEmail;
	}

	/**
	 * Get emails with optional filtering
	 * @param {Object} options - Filter options (category, limit, etc.)
	 * @returns {Promise<Array>} Filtered emails
	 */
	async getEmails(options = {}) {
		const emails = await this.ctx.storage.get('emails') || [];
		const { category, limit = 50, unreadOnly = false } = options;

		let filtered = emails;

		if (category) {
			filtered = filtered.filter(email => email.category === category);
		}

		if (unreadOnly) {
			filtered = filtered.filter(email => !email.read);
		}

		return filtered.slice(0, limit);
	}

	/**
	 * Mark email as read
	 * @param {string} emailId - Email ID
	 * @returns {Promise<boolean>} Success status
	 */
	async markEmailRead(emailId) {
		const emails = await this.ctx.storage.get('emails') || [];
		const email = emails.find(e => e.id === emailId);
		
		if (email) {
			email.read = true;
			await this.ctx.storage.put('emails', emails);
			return true;
		}
		
		return false;
	}

	/**
	 * Update user preferences
	 * @param {Object} preferences - New preferences
	 * @returns {Promise<Object>} Updated preferences
	 */
	async updatePreferences(preferences) {
		const current = await this.ctx.storage.get('preferences') || {};
		const updated = { ...current, ...preferences };
		
		await this.ctx.storage.put('preferences', updated);
		
		return updated;
	}

	/**
	 * Get email statistics
	 * @returns {Promise<Object>} Statistics object
	 */
	async getStats() {
		const emails = await this.ctx.storage.get('emails') || [];
		
		return {
			total: emails.length,
			unread: emails.filter(e => !e.read).length,
			byCategory: {
				important: emails.filter(e => e.category === 'important').length,
				spam: emails.filter(e => e.category === 'spam').length,
				newsletter: emails.filter(e => e.category === 'newsletter').length,
				other: emails.filter(e => !['important', 'spam', 'newsletter'].includes(e.category)).length
			}
		};
	}

	/**
	 * Delete email
	 * @param {string} emailId - Email ID to delete
	 * @returns {Promise<boolean>} Success status
	 */
	async deleteEmail(emailId) {
		const emails = await this.ctx.storage.get('emails') || [];
		const initialLength = emails.length;
		
		const filtered = emails.filter(e => e.id !== emailId);
		
		if (filtered.length < initialLength) {
			await this.ctx.storage.put('emails', filtered);
			return true;
		}
		
		return false;
	}

	/**
	 * Clear all emails (for testing)
	 * @returns {Promise<void>}
	 */
	async clearEmails() {
		await this.ctx.storage.put('emails', []);
	}
}

