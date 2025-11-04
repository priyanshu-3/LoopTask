import { supabaseAdmin } from '@/lib/supabaseClient';
import { encrypt, decrypt } from './encryption';

/**
 * Supported integration providers
 */
export type IntegrationProvider = 'github' | 'notion' | 'slack' | 'calendar';

/**
 * OAuth tokens structure
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
}

/**
 * Stored token with metadata
 */
interface StoredToken {
  userId: string;
  provider: IntegrationProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  encryptedAt: Date;
}

/**
 * TokenManager handles secure storage and retrieval of OAuth tokens
 * 
 * Features:
 * - AES-256-GCM encryption for all tokens
 * - Unique encryption keys per user
 * - Automatic token refresh on expiration
 * - Secure deletion of tokens
 * 
 * Requirements: 1.4, 1.5, 8.1
 */
export class TokenManager {
  /**
   * Store encrypted OAuth tokens in the database
   * 
   * @param userId - User ID who owns the tokens
   * @param provider - Integration provider (github, notion, slack, calendar)
   * @param tokens - OAuth tokens to store
   * @throws Error if storage fails
   */
  async storeToken(
    userId: string,
    provider: IntegrationProvider,
    tokens: OAuthTokens
  ): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!tokens.accessToken) {
      throw new Error('Access token is required');
    }
    
    try {
      // Encrypt the tokens
      const encryptedAccessToken = encrypt(tokens.accessToken, userId);
      const encryptedRefreshToken = tokens.refreshToken
        ? encrypt(tokens.refreshToken, userId)
        : null;
      
      // Prepare the update data based on provider
      const updateData: Record<string, any> = {
        [`${provider}_connected`]: true,
        [`${provider}_token_encrypted`]: encryptedAccessToken,
        updated_at: new Date().toISOString(),
      };
      
      // Add refresh token if provided
      if (encryptedRefreshToken) {
        updateData[`${provider}_refresh_token_encrypted`] = encryptedRefreshToken;
      }
      
      // Add expiration time if provided
      if (tokens.expiresAt) {
        updateData[`${provider}_token_expires_at`] = tokens.expiresAt.toISOString();
      }
      
      // Check if integration record exists
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('integrations')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine
        throw fetchError;
      }
      
      if (existing) {
        // Update existing record
        const { error: updateError } = await supabaseAdmin
          .from('integrations')
          .update(updateData)
          .eq('user_id', userId);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new record
        const { error: insertError } = await supabaseAdmin
          .from('integrations')
          .insert({
            user_id: userId,
            ...updateData,
          });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      console.log(`✅ Stored encrypted ${provider} token for user ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to store ${provider} token:`, error);
      throw new Error(`Failed to store ${provider} token`);
    }
  }
  
  /**
   * Retrieve and decrypt OAuth tokens from the database
   * 
   * @param userId - User ID who owns the tokens
   * @param provider - Integration provider
   * @returns Decrypted tokens or null if not found
   */
  async getToken(
    userId: string,
    provider: IntegrationProvider
  ): Promise<OAuthTokens | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    try {
      // Fetch the integration record
      const { data, error } = await supabaseAdmin
        .from('integrations')
        .select(`
          ${provider}_token_encrypted,
          ${provider}_refresh_token_encrypted,
          ${provider}_token_expires_at,
          ${provider}_connected
        `)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No integration record found
          return null;
        }
        throw error;
      }
      
      // Type assertion for dynamic field access
      const record = data as any;
      
      // Check if provider is connected
      const isConnected = record[`${provider}_connected`];
      if (!isConnected) {
        return null;
      }
      
      // Get encrypted tokens
      const encryptedAccessToken = record[`${provider}_token_encrypted`];
      const encryptedRefreshToken = record[`${provider}_refresh_token_encrypted`];
      const expiresAtStr = record[`${provider}_token_expires_at`];
      
      if (!encryptedAccessToken) {
        return null;
      }
      
      // Decrypt the tokens
      const accessToken = decrypt(encryptedAccessToken, userId);
      const refreshToken = encryptedRefreshToken
        ? decrypt(encryptedRefreshToken, userId)
        : undefined;
      
      const expiresAt = expiresAtStr ? new Date(expiresAtStr) : undefined;
      
      return {
        accessToken,
        refreshToken,
        expiresAt,
      };
    } catch (error) {
      console.error(`❌ Failed to retrieve ${provider} token:`, error);
      throw new Error(`Failed to retrieve ${provider} token`);
    }
  }
  
  /**
   * Get a valid access token, automatically refreshing if expired
   * 
   * This method checks if the token is expired and automatically
   * refreshes it using the refresh token if needed.
   * 
   * @param userId - User ID who owns the tokens
   * @param provider - Integration provider
   * @param refreshCallback - Optional callback to refresh the token
   * @returns Valid access token
   * @throws Error if token is expired and cannot be refreshed
   */
  async getValidToken(
    userId: string,
    provider: IntegrationProvider,
    refreshCallback?: (refreshToken: string) => Promise<OAuthTokens>
  ): Promise<string> {
    const tokens = await this.getToken(userId, provider);
    
    if (!tokens) {
      throw new Error(`No ${provider} token found for user`);
    }
    
    // Check if token is expired
    const now = new Date();
    const isExpired = tokens.expiresAt && tokens.expiresAt <= now;
    
    if (!isExpired) {
      // Token is still valid
      return tokens.accessToken;
    }
    
    // Token is expired, try to refresh
    if (!tokens.refreshToken) {
      throw new Error(`${provider} token expired and no refresh token available`);
    }
    
    if (!refreshCallback) {
      throw new Error(`${provider} token expired but no refresh callback provided`);
    }
    
    try {
      console.log(`🔄 Refreshing expired ${provider} token for user ${userId}`);
      
      // Call the refresh callback to get new tokens
      const newTokens = await refreshCallback(tokens.refreshToken);
      
      // Store the new tokens
      await this.storeToken(userId, provider, newTokens);
      
      console.log(`✅ Successfully refreshed ${provider} token`);
      
      return newTokens.accessToken;
    } catch (error) {
      console.error(`❌ Failed to refresh ${provider} token:`, error);
      
      // Mark the connection as requiring reauthorization
      await this.markAsRequiringReauth(userId, provider);
      
      throw new Error(`Failed to refresh ${provider} token. Reauthorization required.`);
    }
  }
  
  /**
   * Delete OAuth tokens from the database
   * 
   * This method securely removes all tokens for a provider
   * and marks the integration as disconnected.
   * 
   * @param userId - User ID who owns the tokens
   * @param provider - Integration provider
   */
  async deleteToken(
    userId: string,
    provider: IntegrationProvider
  ): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    try {
      // Prepare the update data to clear tokens
      const updateData: Record<string, any> = {
        [`${provider}_connected`]: false,
        [`${provider}_token_encrypted`]: null,
        [`${provider}_refresh_token_encrypted`]: null,
        [`${provider}_token_expires_at`]: null,
        updated_at: new Date().toISOString(),
      };
      
      // Update the database
      const { error } = await supabaseAdmin
        .from('integrations')
        .update(updateData)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      console.log(`✅ Deleted ${provider} token for user ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to delete ${provider} token:`, error);
      throw new Error(`Failed to delete ${provider} token`);
    }
  }
  
  /**
   * Check if a provider is connected for a user
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   * @returns True if connected, false otherwise
   */
  async isConnected(
    userId: string,
    provider: IntegrationProvider
  ): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('integrations')
        .select(`${provider}_connected`)
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        return false;
      }
      
      // Type assertion for dynamic field access
      const record = data as any;
      return record[`${provider}_connected`] === true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Mark a connection as requiring reauthorization
   * 
   * This is called when token refresh fails or tokens are invalid
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   */
  private async markAsRequiringReauth(
    userId: string,
    provider: IntegrationProvider
  ): Promise<void> {
    try {
      // For now, we'll just disconnect the integration
      // In the future, we could add a separate "requires_reauth" flag
      await this.deleteToken(userId, provider);
      
      console.log(`⚠️  Marked ${provider} as requiring reauthorization for user ${userId}`);
    } catch (error) {
      console.error(`Failed to mark ${provider} as requiring reauth:`, error);
    }
  }
}

// Export a singleton instance
export const tokenManager = new TokenManager();
