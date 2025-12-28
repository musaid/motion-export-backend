import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;

/**
 * Get encryption key from environment variable
 * Key is hashed to ensure it's exactly 32 bytes for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }
  // Hash to ensure exactly 32 bytes
  const hash = crypto.createHash('sha256');
  hash.update(key);
  return hash.digest();
}

/**
 * Encrypt license key for recovery purposes
 * Uses AES-256-GCM with random IV per encryption
 * Returns base64 string containing: salt + iv + authTag + ciphertext
 *
 * Following GitHub/Google recovery code standards for secure storage
 */
export function encryptLicenseKey(plainKey: string): string {
  const key = getEncryptionKey();

  // Generate random IV (unique per encryption - critical for GCM security)
  const iv = crypto.randomBytes(IV_LENGTH);

  // Generate random salt (additional security layer)
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  const encrypted = Buffer.concat([
    cipher.update(plainKey, 'utf8'),
    cipher.final(),
  ]);

  // Get authentication tag (verifies data wasn't tampered with)
  const authTag = cipher.getAuthTag();

  // Combine all components: salt + iv + authTag + encrypted
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypt license key for recovery
 * Reverses the encryption process to retrieve original license key
 */
export function decryptLicenseKey(encryptedData: string): string {
  const key = getEncryptionKey();

  // Decode from base64
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract components in same order they were combined
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
  );
  const ciphertext = combined.subarray(
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
  );

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
