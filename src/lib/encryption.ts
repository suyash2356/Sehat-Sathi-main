import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'sehat-sathi-fallback-secret-2025';

/**
 * Encrypts a string using AES.
 */
export const encryptData = (text: string): string => {
    if (!text) return '';
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * Decrypts an AES-encrypted string.
 * Handles legacy plain-text data gracefully.
 */
export const decryptData = (ciphertext: string): string => {
    if (!ciphertext) return '';

    // Check if it's potentially encrypted (AES output is usually base64-like)
    // If it's short or has spaces, it's likely plain text
    if (ciphertext.length < 10 || ciphertext.includes(' ')) {
        return ciphertext;
    }

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        // We need to catch errors specific to Utf8 conversion (like Malformed UTF-8)
        try {
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted || ciphertext; // Fallback to original if decrypted is empty
        } catch (utf8Error) {
            console.warn('UTF-8 conversion failed, returning original text');
            return ciphertext;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return ciphertext; // Return original text on error (handles legacy data)
    }
};
