import crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size is 16 bytes

/**
 * Derives a 32-byte key from the environment variable using SHA-256.
 * This guarantees the key is exactly 256 bits (32 bytes) long.
 */
function getEncryptionKey(): Buffer {
  const rawKey = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!rawKey) {
    // Falls back to a default development key for local convenience
    // in case env is not loaded or missing.
    console.warn("WARNING: DOCUMENT_ENCRYPTION_KEY is not defined. Using development fallback key.");
    return crypto.createHash("sha256").update("oge-academie-development-fallback-key-32-octets").digest();
  }
  return crypto.createHash("sha256").update(rawKey).digest();
}

/**
 * Encrypts a file buffer using AES-256-CBC.
 * The 16-byte IV is prepended to the returned encrypted buffer.
 */
export function encryptDocument(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);
  
  // Return IV + Encrypted Data
  return Buffer.concat([iv, encrypted]);
}

/**
 * Decrypts a file buffer using AES-256-CBC.
 * Assumes the first 16 bytes of the buffer are the IV.
 */
export function decryptDocument(buffer: Buffer): Buffer {
  if (buffer.length < IV_LENGTH) {
    throw new Error("Invalid encrypted buffer: too short to contain IV.");
  }
  
  const iv = buffer.subarray(0, IV_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH);
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
}
