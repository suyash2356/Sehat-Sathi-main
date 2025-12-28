const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const REQUIRED_KEYS = [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
];

console.log("Checking .env.local variables:");
let allPresent = true;

REQUIRED_KEYS.forEach(key => {
    const value = envConfig[key];
    const isPresent = !!value;
    const length = value ? value.length : 0;
    console.log(`${key}: ${isPresent ? 'PRESENT' : 'MISSING'} (Length: ${length})`);

    if (!isPresent) allPresent = false;

    if (key === 'FIREBASE_PRIVATE_KEY' && isPresent) {
        if (!value.includes('BEGIN PRIVATE KEY')) {
            console.log(`  WARNING: FIREBASE_PRIVATE_KEY does not appear to be a valid PEM key.`);
        }
    }
});

if (!allPresent) {
    console.error("\n❌ Some required environment variables are missing.");
    process.exit(1);
} else {
    console.log("\n✅ All required environment variables are present.");
}
