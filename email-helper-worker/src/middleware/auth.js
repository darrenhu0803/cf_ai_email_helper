/**
 * Authentication Middleware
 * Protects routes and verifies user sessions
 */

import { verifySession, getSessionToken } from '../services/auth.js';

/**
 * Middleware to require authentication
 * Returns 401 if not authenticated, otherwise calls next handler
 */
export async function requireAuth(request, env, handler) {
  const sessionToken = getSessionToken(request);

  if (!sessionToken) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Authentication required'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const verification = await verifySession(env, sessionToken);

  if (!verification.valid) {
    return new Response(JSON.stringify({
      success: false,
      error: verification.error || 'Invalid session'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Attach user to request for use in handler
  request.user = verification.user;

  // Call the actual handler
  return handler(request, env);
}

/**
 * Optional auth - doesn't require auth but adds user if present
 */
export async function optionalAuth(request, env, handler) {
  const sessionToken = getSessionToken(request);

  if (sessionToken) {
    const verification = await verifySession(env, sessionToken);
    if (verification.valid) {
      request.user = verification.user;
    }
  }

  return handler(request, env);
}

