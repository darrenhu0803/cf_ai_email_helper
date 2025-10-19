/**
 * LLM Service - Workers AI Integration
 * 
 * Handles all AI interactions including:
 * - Email summarization
 * - Email classification
 * - Chat responses
 */

/**
 * Summarize email content using Workers AI
 * @param {Object} ai - Workers AI binding
 * @param {string} emailContent - Full email text
 * @param {Object} metadata - Email metadata (from, subject, etc.)
 * @returns {Promise<string>} Concise summary
 */
export async function summarizeEmail(ai, emailContent, metadata = {}) {
	const { from = '', subject = '' } = metadata;
	
	const prompt = `You are an email assistant. Summarize the following email in 2-3 concise sentences. Focus on the main points and action items.

From: ${from}
Subject: ${subject}

Email Content:
${emailContent}

Summary:`;

	try {
		const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
			messages: [
				{
					role: 'system',
					content: 'You are a helpful email assistant that creates concise, accurate summaries of emails. Keep summaries to 2-3 sentences maximum.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			max_tokens: 150,
			temperature: 0.3 // Lower temperature for more focused summaries
		});

		// Extract the summary from the response
		const summary = response.response || response.text || 'Unable to generate summary';
		return summary.trim();

	} catch (error) {
		console.error('Error summarizing email:', error);
		return `Email from ${from} about ${subject}`;
	}
}

/**
 * Classify email into categories
 * @param {Object} ai - Workers AI binding
 * @param {string} emailContent - Email content
 * @param {Object} metadata - Email metadata
 * @returns {Promise<Object>} Classification result
 */
export async function classifyEmail(ai, emailContent, metadata = {}) {
	const { from = '', subject = '' } = metadata;
	
	const prompt = `Classify the following email into ONE category:
- important: Work-related, urgent, from known contacts, requires action
- spam: Unsolicited, promotional with excessive urgency, suspicious links
- newsletter: Subscribed content, updates, regular digests
- promotional: Legitimate marketing, deals, offers
- social: Social media notifications, friend requests
- other: Everything else

From: ${from}
Subject: ${subject}
Content: ${emailContent.substring(0, 500)}

Respond with ONLY the category name (lowercase, one word).`;

	try {
		const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
			messages: [
				{
					role: 'system',
					content: 'You are an email classifier. Respond with only one word: important, spam, newsletter, promotional, social, or other.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			max_tokens: 20,
			temperature: 0.1 // Very low temperature for consistent classification
		});

		const category = (response.response || response.text || 'other')
			.toLowerCase()
			.trim()
			.replace(/[^a-z]/g, ''); // Remove any non-letter characters

		// Validate category
		const validCategories = ['important', 'spam', 'newsletter', 'promotional', 'social', 'other'];
		const finalCategory = validCategories.includes(category) ? category : 'other';

		// Determine if should be filtered
		const shouldFilter = finalCategory === 'spam';

		// Calculate confidence (simplified)
		const confidence = finalCategory === 'spam' ? 0.9 : 0.75;

		return {
			category: finalCategory,
			confidence,
			shouldFilter,
			reason: getClassificationReason(finalCategory, from, subject)
		};

	} catch (error) {
		console.error('Error classifying email:', error);
		return {
			category: 'other',
			confidence: 0.5,
			shouldFilter: false,
			reason: 'Classification failed'
		};
	}
}

/**
 * Generate a reason for the classification
 * @param {string} category - Category name
 * @param {string} from - Email sender
 * @param {string} subject - Email subject
 * @returns {string} Human-readable reason
 */
function getClassificationReason(category, from, subject) {
	switch (category) {
		case 'important':
			return 'Appears to be work-related or requires attention';
		case 'spam':
			return 'Identified as spam or unsolicited content';
		case 'newsletter':
			return 'Regular newsletter or digest content';
		case 'promotional':
			return 'Marketing or promotional content';
		case 'social':
			return 'Social media or community notification';
		default:
			return 'General email';
	}
}

/**
 * Generate chat response with email context
 * @param {Object} ai - Workers AI binding
 * @param {string} userMessage - User's chat message
 * @param {Array} emailContext - Relevant emails for context
 * @param {Array} chatHistory - Previous conversation messages
 * @returns {Promise<string>} AI response
 */
export async function generateChatResponse(ai, userMessage, emailContext = [], chatHistory = []) {
	// Format email context
	const emailSummaries = emailContext.map((email, index) => {
		return `Email ${index + 1}:
From: ${email.from || 'Unknown'}
Subject: ${email.subject || 'No subject'}
Category: ${email.category || 'unknown'}
${email.summary ? `Summary: ${email.summary}` : `Content: ${email.content?.substring(0, 200)}...`}`;
	}).join('\n\n');

	// Build conversation history for context
	const messages = [
		{
			role: 'system',
			content: `You are a helpful email assistant. You help users manage their emails by answering questions, providing summaries, and suggesting actions.

Available emails:
${emailSummaries || 'No emails available'}

Current user preferences:
- Filter spam automatically
- Summarize important emails
- Notify on important emails

When responding:
1. Be concise and helpful
2. Reference specific emails when relevant
3. Suggest actions (archive, delete, reply) when appropriate
4. If no emails match the query, politely say so`
		}
	];

	// Add chat history (last 5 messages for context)
	const recentHistory = chatHistory.slice(-5);
	messages.push(...recentHistory);

	// Add current user message
	messages.push({
		role: 'user',
		content: userMessage
	});

	try {
		const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
			messages,
			max_tokens: 300,
			temperature: 0.7 // Moderate temperature for natural conversation
		});

		return (response.response || response.text || 'I apologize, I could not generate a response.').trim();

	} catch (error) {
		console.error('Error generating chat response:', error);
		return 'I apologize, I encountered an error processing your request. Please try again.';
	}
}

/**
 * Extract action items from email
 * @param {Object} ai - Workers AI binding
 * @param {string} emailContent - Email content
 * @returns {Promise<Array>} List of action items
 */
export async function extractActionItems(ai, emailContent) {
	const prompt = `Extract any action items or tasks from this email. List each as a short, clear task. If there are no action items, respond with "None".

Email:
${emailContent}

Action items:`;

	try {
		const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
			messages: [
				{
					role: 'system',
					content: 'Extract action items from emails. List them as clear, actionable tasks or respond with "None".'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			max_tokens: 150,
			temperature: 0.3
		});

		const text = (response.response || response.text || 'None').trim();
		
		if (text.toLowerCase() === 'none' || text.length === 0) {
			return [];
		}

		// Split by line breaks and filter out empty lines
		return text
			.split('\n')
			.map(item => item.trim())
			.filter(item => item.length > 0 && item !== 'None')
			.map(item => item.replace(/^[-•*]\s*/, '')); // Remove bullet points

	} catch (error) {
		console.error('Error extracting action items:', error);
		return [];
	}
}

/**
 * Generate a smart reply suggestion
 * @param {Object} ai - Workers AI binding
 * @param {Object} email - Email to reply to
 * @param {string} replyContext - Context for the reply
 * @returns {Promise<string>} Suggested reply text
 */
export async function generateReplySuggestion(ai, email, replyContext = 'brief acknowledgment') {
	const prompt = `Generate a ${replyContext} reply to this email:

From: ${email.from}
Subject: ${email.subject}
Content: ${email.content}

Reply:`;

	try {
		const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
			messages: [
				{
					role: 'system',
					content: 'You write professional, concise email replies. Keep them brief and appropriate.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			max_tokens: 200,
			temperature: 0.7
		});

		return (response.response || response.text || '').trim();

	} catch (error) {
		console.error('Error generating reply:', error);
		return '';
	}
}

