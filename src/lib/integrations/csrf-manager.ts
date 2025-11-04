import { randomBytes } from 'crypto';

interface StateToken {
  token: string;
  provider: string;
  userId: string;
  expiresAt: Date;
}

// In-memory store for state tokens (in production, use Redis or database)
const stateStore = new Map<string, StateToken>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [token, data] of stateStore.entries()) {
    if (data.expiresAt < now) {
      stateStore.delete(token);
    }
  }
}, 5 * 60 * 1000);

export class CSRFManager {
  /**
   * Generate a unique state token for OAuth flow
   * @param userId - User ID initiating the OAuth flow
   * @param provider - Integration provider name
   * @returns State token string
   */
  static generateStateToken(userId: string, provider: string): string {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    stateStore.set(token, {
      token,
      provider,
      userId,
      expiresAt,
    });

    return token;
  }

  /**
   * Validate state token from OAuth callback
   * @param token - State token from callback
   * @param userId - User ID from session
   * @param provider - Integration provider name
   * @returns True if valid, false otherwise
   */
  static validateStateToken(
    token: string,
    userId: string,
    provider: string
  ): boolean {
    const storedToken = stateStore.get(token);

    if (!storedToken) {
      return false;
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      stateStore.delete(token);
      return false;
    }

    // Validate token matches user and provider
    if (storedToken.userId !== userId || storedToken.provider !== provider) {
      return false;
    }

    // Delete token after validation (one-time use)
    stateStore.delete(token);

    return true;
  }

  /**
   * Clean up all tokens for a user (e.g., on logout)
   * @param userId - User ID
   */
  static cleanupUserTokens(userId: string): void {
    for (const [token, data] of stateStore.entries()) {
      if (data.userId === userId) {
        stateStore.delete(token);
      }
    }
  }
}
