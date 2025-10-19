/**
 * Email Processor Service
 * 
 * Handles email processing pipeline:
 * - Parse email content
 * - Classify email
 * - Generate summary
 * - Extract metadata
 */

import { summarizeEmail, classifyEmail, extractActionItems } from './llm.js';

/**
 * Process a raw email through the full pipeline
 * @param {Object} ai - Workers AI binding
 * @param {Object} rawEmail - Raw email data
 * @returns {Promise<Object>} Processed email
 */
export async function processEmail(ai, rawEmail) {
	const { from, to, subject, content, headers = {} } = rawEmail;

	// Extract metadata
	const metadata = {
		from,
		to,
		subject,
		receivedAt: new Date().toISOString(),
		headers
	};

	try {
		// Step 1: Classify the email
		const classification = await classifyEmail(ai, content, { from, subject });

		// Step 2: Generate summary (only for important emails or if requested)
		let summary = '';
		let actionItems = [];

		if (classification.category === 'important' || classification.category === 'other') {
			summary = await summarizeEmail(ai, content, { from, subject });
			
			// Extract action items for important emails
			if (classification.category === 'important') {
				actionItems = await extractActionItems(ai, content);
			}
		} else {
			// Quick summary for other categories
			summary = `${classification.category.charAt(0).toUpperCase() + classification.category.slice(1)} email from ${from}`;
		}

		// Step 3: Build processed email object
		const processedEmail = {
			...metadata,
			content,
			category: classification.category,
			classification: {
				confidence: classification.confidence,
				reason: classification.reason,
				shouldFilter: classification.shouldFilter
			},
			summary,
			actionItems,
			read: false,
			archived: false,
			processedAt: new Date().toISOString()
		};

		return processedEmail;

	} catch (error) {
		console.error('Error processing email:', error);
		
		// Return basic processed email on error
		return {
			...metadata,
			content,
			category: 'other',
			classification: {
				confidence: 0,
				reason: 'Processing error',
				shouldFilter: false
			},
			summary: `Email from ${from} about ${subject}`,
			actionItems: [],
			read: false,
			archived: false,
			processedAt: new Date().toISOString(),
			error: error.message
		};
	}
}

/**
 * Parse raw email data from Email Routing
 * @param {Object} emailMessage - Raw email from Cloudflare Email Routing
 * @returns {Object} Parsed email
 */
export function parseEmailMessage(emailMessage) {
	// Extract common email fields
	return {
		from: emailMessage.from || emailMessage.headers?.get('from') || 'unknown@sender.com',
		to: emailMessage.to || emailMessage.headers?.get('to') || '',
		subject: emailMessage.headers?.get('subject') || '(No subject)',
		content: emailMessage.body || emailMessage.raw || '',
		headers: {
			messageId: emailMessage.headers?.get('message-id') || '',
			date: emailMessage.headers?.get('date') || new Date().toISOString(),
			contentType: emailMessage.headers?.get('content-type') || 'text/plain'
		},
		rawSize: emailMessage.rawSize || 0
	};
}

/**
 * Filter emails based on user preferences
 * @param {Array} emails - Array of emails
 * @param {Object} preferences - User preferences
 * @returns {Array} Filtered emails
 */
export function filterEmails(emails, preferences = {}) {
	const {
		filterSpam = true,
		filterNewsletters = false,
		filterPromotional = false,
		showOnlyUnread = false
	} = preferences;

	return emails.filter(email => {
		// Filter spam if enabled
		if (filterSpam && email.category === 'spam') {
			return false;
		}

		// Filter newsletters if enabled
		if (filterNewsletters && email.category === 'newsletter') {
			return false;
		}

		// Filter promotional if enabled
		if (filterPromotional && email.category === 'promotional') {
			return false;
		}

		// Show only unread if enabled
		if (showOnlyUnread && email.read) {
			return false;
		}

		return true;
	});
}

/**
 * Sort emails by various criteria
 * @param {Array} emails - Array of emails
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted emails
 */
export function sortEmails(emails, sortBy = 'date') {
	const sorted = [...emails];

	switch (sortBy) {
		case 'date':
		case 'newest':
			return sorted.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
		
		case 'oldest':
			return sorted.sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));
		
		case 'importance':
			// Important first, then others
			const importanceOrder = { important: 0, other: 1, social: 2, promotional: 3, newsletter: 4, spam: 5 };
			return sorted.sort((a, b) => {
				const orderA = importanceOrder[a.category] ?? 99;
				const orderB = importanceOrder[b.category] ?? 99;
				return orderA - orderB;
			});
		
		case 'sender':
			return sorted.sort((a, b) => (a.from || '').localeCompare(b.from || ''));
		
		default:
			return sorted;
	}
}

/**
 * Search emails by content, subject, or sender
 * @param {Array} emails - Array of emails
 * @param {string} query - Search query
 * @returns {Array} Matching emails
 */
export function searchEmails(emails, query) {
	const lowerQuery = query.toLowerCase();

	return emails.filter(email => {
		return (
			email.from?.toLowerCase().includes(lowerQuery) ||
			email.subject?.toLowerCase().includes(lowerQuery) ||
			email.content?.toLowerCase().includes(lowerQuery) ||
			email.summary?.toLowerCase().includes(lowerQuery)
		);
	});
}

/**
 * Get email statistics
 * @param {Array} emails - Array of emails
 * @returns {Object} Statistics
 */
export function getEmailStatistics(emails) {
	const stats = {
		total: emails.length,
		unread: 0,
		byCategory: {
			important: 0,
			spam: 0,
			newsletter: 0,
			promotional: 0,
			social: 0,
			other: 0
		},
		withActionItems: 0,
		averageConfidence: 0
	};

	let totalConfidence = 0;

	emails.forEach(email => {
		if (!email.read) stats.unread++;
		if (email.actionItems?.length > 0) stats.withActionItems++;
		
		if (email.category && stats.byCategory.hasOwnProperty(email.category)) {
			stats.byCategory[email.category]++;
		}

		if (email.classification?.confidence) {
			totalConfidence += email.classification.confidence;
		}
	});

	stats.averageConfidence = emails.length > 0 ? totalConfidence / emails.length : 0;

	return stats;
}

