import crypto from 'crypto';

/**
 * Encryption utilities for securing OAuth tokens
 * Uses AES-256-GCM encryption with unique keys per user
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const AUTH_TAG_LENGTH = 16; // 16 bytes for GCM auth tag
const SALT_LENGTH = 32; // 32 bytes for key derivation

/**
 * Get the master encryption key from environment
 * In production, this should be a strong, randomly generated key
 */
function getMasterKey(): string {
  const key = process.env.ENCRYPTION_MASTER_KEY;
  
  if (!key) {
    // For development, use a default key (NOT for production!)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Using default encryption key. Set ENCRYPTION_MASTER_KEY in production!');
      return 'dev-master-key-32-bytes-long!!'; // 32 bytes
    }
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
  }
  
  return key;
}

/**
 * Derive a unique encryption key for a specific user
 * This ensures each user's tokens are encrypted with a different key
 */
function deriveUserKey(userId: string, salt: Buffer): Buffer {
  const masterKey = getMasterKey();
  
  // Use PBKDF2 to derive a user-specific key
  return crypto.pbkdf2Sync(
    `${masterKey}:${userId}`,
    salt,
    100000, // iterations
    32, // key length (256 bits)
    'sha256'
  );
}

/**
 * Encrypt a token using AES-256-GCM
 * Returns base64-encoded encrypted data with format: salt:iv:authTag:encryptedData
 */
export function encrypt(plaintext: string, userId: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string');
  }
  
  if (!userId) {
    throw new Error('User ID is required for encryption');
  }
  
  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Derive user-specific key
  const key = deriveUserKey(userId, salt);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get the auth tag
  const authTag = cipher.getAuthTag();
  
  // Combine salt, IV, auth tag, and encrypted data
  // Format: salt:iv:authTag:encryptedData
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted
  ].join(':');
}

/**
 * Decrypt a token using AES-256-GCM
 * Expects base64-encoded data with format: salt:iv:authTag:encryptedData
 */
export function decrypt(encryptedData: string, userId: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty string');
  }
  
  if (!userId) {
    throw new Error('User ID is required for decryption');
  }
  
  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltB64, ivB64, authTagB64, encrypted] = parts;
    
    // Convert from base64
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    
    // Derive the same user-specific key
    const key = deriveUserKey(userId, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Don't expose internal error details
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Validate that encryption/decryption is working correctly
 * Useful for testing and debugging
 */
export function validateEncryption(userId: string): boolean {
  try {
    const testData = 'test-token-12345';
    const encrypted = encrypt(testData, userId);
    const decrypted = decrypt(encrypted, userId);
    return testData === decrypted;
  } catch (error) {
    return false;
  }
}
