/**
 * Authentication Service
 * Handles user registration, login, and session management
 */

import { hashPassword, verifyPassword } from '../utils/crypto.js';

/**
 * Register a new user
 */
export async function registerUser(env, email, password, name) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Validate password strength
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  try {
    // Use email as user ID (normalized)
    const userId = email.toLowerCase();

    // Get or create UserState Durable Object
    const id = env.USER_STATE.idFromName(userId);
    const userState = env.USER_STATE.get(id);

    // Check if user already exists
    const response = await userState.fetch('http://internal/get');
    const existingData = await response.json();

    if (existingData.state?.user?.email) {
      return { success: false, error: 'User already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Store user data
    const userData = {
      email: userId,
      name: name || email.split('@')[0],
      passwordHash,
      createdAt: new Date().toISOString(),
      emailProviders: [] // Will store connected email accounts
    };

    const setResponse = await userState.fetch('http://internal/set-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userData })
    });

    if (!setResponse.ok) {
      return { success: false, error: 'Failed to create user' };
    }

    // Generate session token
    const sessionToken = await generateSessionToken(userId);

    return {
      success: true,
      user: {
        id: userId,
        email: userId,
        name: userData.name
      },
      sessionToken
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * Login user
 */
export async function loginUser(env, email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const userId = email.toLowerCase();

    // Get UserState Durable Object
    const id = env.USER_STATE.idFromName(userId);
    const userState = env.USER_STATE.get(id);

    // Get user data
    const response = await userState.fetch('http://internal/get');
    const data = await response.json();

    if (!data.state?.user?.email) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = data.state.user;

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate session token
    const sessionToken = await generateSessionToken(userId);

    return {
      success: true,
      user: {
        id: userId,
        email: user.email,
        name: user.name
      },
      sessionToken
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Verify session token and get user
 */
export async function verifySession(env, sessionToken) {
  if (!sessionToken) {
    return { valid: false, error: 'No session token provided' };
  }

  try {
    const { userId, expiresAt } = await decodeSessionToken(sessionToken);

    // Check if token is expired
    if (Date.now() > expiresAt) {
      return { valid: false, error: 'Session expired' };
    }

    // Get user data
    const id = env.USER_STATE.idFromName(userId);
    const userState = env.USER_STATE.get(id);
    const response = await userState.fetch('http://internal/get');
    const data = await response.json();

    if (!data.state?.user?.email) {
      return { valid: false, error: 'User not found' };
    }

    return {
      valid: true,
      user: {
        id: userId,
        email: data.state.user.email,
        name: data.state.user.name
      }
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { valid: false, error: 'Invalid session token' };
  }
}

/**
 * Generate a session token (JWT-like)
 * In production, use a proper JWT library or Cloudflare Access
 */
async function generateSessionToken(userId) {
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
  
  const payload = {
    userId,
    expiresAt,
    iat: Date.now()
  };

  // Simple base64 encoding (in production, use signed JWT)
  const token = btoa(JSON.stringify(payload));
  return token;
}

/**
 * Decode session token
 */
async function decodeSessionToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    return payload;
  } catch (error) {
    throw new Error('Invalid token format');
  }
}

/**
 * Extract session token from request
 */
export function getSessionToken(request) {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith('session='));
    if (sessionCookie) {
      return sessionCookie.substring(8);
    }
  }

  return null;
}

