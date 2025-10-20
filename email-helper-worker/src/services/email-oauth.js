/**
 * Email Provider OAuth Service
 * Handles OAuth flows for Gmail, Outlook, etc.
 */

/**
 * Get Gmail OAuth configuration from environment
 */
function getGmailConfig(env) {
  return {
    clientId: env?.GMAIL_CLIENT_ID || '',
    clientSecret: env?.GMAIL_CLIENT_SECRET || '',
    redirectUri: env?.GMAIL_REDIRECT_URI || 'http://localhost:8787/api/oauth/gmail/callback',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ]
  };
}

/**
 * Generate Gmail OAuth authorization URL
 */
export function getGmailAuthUrl(state, env = {}) {
  const config = getGmailConfig(env);
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: state || crypto.randomUUID()
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGmailCode(code, env = {}) {
  try {
    const config = getGmailConfig(env);
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code: ${error}`);
    }

    const tokens = await response.json();
    return {
      success: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type
    };
  } catch (error) {
    console.error('Gmail token exchange error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Refresh Gmail access token
 */
export async function refreshGmailToken(refreshToken, env = {}) {
  try {
    const config = getGmailConfig(env);
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    return {
      success: true,
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetch Gmail messages
 */
export async function fetchGmailMessages(accessToken, options = {}) {
  const {
    maxResults = 10,
    query = '',
    pageToken = null
  } = options;

  try {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
    });

    if (query) params.append('q', query);
    if (pageToken) params.append('pageToken', pageToken);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      messages: data.messages || [],
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    console.error('Fetch Gmail messages error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Gmail message details
 */
export async function getGmailMessage(accessToken, messageId) {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    const message = await response.json();

    // Parse email data
    const headers = message.payload.headers;
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // Get email body
    let body = '';
    if (message.payload.body.data) {
      body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (message.payload.parts) {
      const textPart = message.payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart && textPart.body.data) {
        body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
    }

    return {
      success: true,
      email: {
        id: message.id,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        content: body,
        labels: message.labelIds || [],
        snippet: message.snippet
      }
    };
  } catch (error) {
    console.error('Get Gmail message error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Store email provider credentials in UserState
 */
export async function storeEmailProvider(env, userId, provider, credentials) {
  try {
    const id = env.USER_STATE.idFromName(userId);
    const userState = env.USER_STATE.get(id);

    // Get current state
    const response = await userState.fetch('http://internal/get');
    const data = await response.json();
    const currentUser = data.state?.user || {};

    // Add or update provider
    const providers = currentUser.emailProviders || [];
    const existingIndex = providers.findIndex(p => p.provider === provider);

    const providerData = {
      provider,
      email: credentials.email,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      expiresAt: Date.now() + (credentials.expiresIn * 1000),
      connectedAt: existingIndex === -1 ? new Date().toISOString() : providers[existingIndex].connectedAt
    };

    if (existingIndex === -1) {
      providers.push(providerData);
    } else {
      providers[existingIndex] = providerData;
    }

    // Update user
    currentUser.emailProviders = providers;
    await userState.fetch('http://internal/set-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser })
    });

    return {
      success: true,
      provider: providerData
    };
  } catch (error) {
    console.error('Store provider error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get stored email provider credentials
 */
export async function getEmailProvider(env, userId, provider) {
  try {
    const id = env.USER_STATE.idFromName(userId);
    const userState = env.USER_STATE.get(id);

    const response = await userState.fetch('http://internal/get');
    const data = await response.json();
    const user = data.state?.user || {};

    const providers = user.emailProviders || [];
    const providerData = providers.find(p => p.provider === provider);

    if (!providerData) {
      return {
        success: false,
        error: 'Provider not connected'
      };
    }

    // Check if token needs refresh
    if (providerData.expiresAt < Date.now() + (5 * 60 * 1000)) { // Refresh if expires in < 5 min
      if (provider === 'gmail' && providerData.refreshToken) {
        const refreshResult = await refreshGmailToken(providerData.refreshToken, env);
        if (refreshResult.success) {
          providerData.accessToken = refreshResult.accessToken;
          providerData.expiresAt = Date.now() + (refreshResult.expiresIn * 1000);
          
          // Store updated token
          await storeEmailProvider(env, userId, provider, {
            email: providerData.email,
            accessToken: refreshResult.accessToken,
            refreshToken: providerData.refreshToken,
            expiresIn: refreshResult.expiresIn
          });
        }
      }
    }

    return {
      success: true,
      provider: providerData
    };
  } catch (error) {
    console.error('Get provider error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

