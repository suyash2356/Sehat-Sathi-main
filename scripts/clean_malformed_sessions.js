/**
 * clean_malformed_sessions.js
 * Uses firebase-admin (already in dependencies) to scan 'callSessions' and 'prescriptions'
 * for documents missing required participant fields and optionally delete them.
 *
 * Usage:
 *   node ./scripts/clean_malformed_sessions.js --dry    # default, lists candidates
 *   node ./scripts/clean_malformed_sessions.js --apply  # deletes found docs (destructive)
 *
 * Ensure GOOGLE_APPLICATION_CREDENTIALS is set to a service account JSON with Firestore access,
 * or run this in an environment with Application Default Credentials.
 */

const admin = require('firebase-admin');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    apply: args.includes('--apply'),
    dry: !args.includes('--apply')
  };
}

async function main() {
  const { apply } = parseArgs();

  // Initialize firebase-admin
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const key = require(path.resolve(keyPath));
      admin.initializeApp({ credential: admin.credential.cert(key) });
    } else {
      admin.initializeApp(); // use ADC
    }
  } catch (e) {
    console.error('Failed to initialize firebase-admin. Ensure GOOGLE_APPLICATION_CREDENTIALS is set to a valid service account JSON.');
    console.error(e);
    process.exit(1);
  }

  const db = admin.firestore();
  console.log('Connected to Firestore via firebase-admin');

  async function scanCollection(collPath, requiredFields) {
    console.log(`Scanning ${collPath} for missing fields: ${requiredFields.join(', ')}`);
    const snapshot = await db.collection(collPath).get();
    const bad = [];
    snapshot.forEach(doc => {
      const data = doc.data() || {};
      const missing = requiredFields.filter(f => typeof data[f] !== 'string');
      if (missing.length) bad.push({ id: doc.id, missing, data });
    });
    return bad;
  }

  const badSessions = await scanCollection('callSessions', ['patientId', 'doctorId']);
  const badPrescriptions = await scanCollection('prescriptions', ['patientId', 'doctorId']);

  console.log('\nFound bad callSessions:', badSessions.length);
  badSessions.slice(0, 200).forEach(d => console.log(d.id, d.missing));

  console.log('\nFound bad prescriptions:', badPrescriptions.length);
  badPrescriptions.slice(0, 200).forEach(d => console.log(d.id, d.missing));

  if (apply) {
    for (const d of badSessions) {
      console.log('Deleting callSessions/', d.id);
      await db.collection('callSessions').doc(d.id).delete();
    }
    for (const d of badPrescriptions) {
      console.log('Deleting prescriptions/', d.id);
      await db.collection('prescriptions').doc(d.id).delete();
    }
    console.log('Applied deletions');
  } else {
    console.log('\nDry run complete. To delete these docs run with --apply');
  }
}

main().catch(err => { console.error(err); process.exitCode = 1; });
