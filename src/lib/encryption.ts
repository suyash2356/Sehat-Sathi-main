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
 */
export const decryptData = (ciphertext: string): string => {
    if (!ciphertext) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || '[Encrypted]';
    } catch (error) {
        console.error('Decryption error:', error);
        return '[Encrypted]';
    }
};
