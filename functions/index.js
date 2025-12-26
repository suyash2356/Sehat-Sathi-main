const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize SDK (use default app)
try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized
}

const db = admin.firestore();

// Trigger: when a callSessions document is deleted, mark the appointment completed
exports.onCallSessionDeleted = functions.firestore
  .document('callSessions/{sessionId}')
  .onDelete(async (snap, context) => {
    const deleted = snap.data();
    const appointmentId = deleted && deleted.appointmentId;
    if (!appointmentId) return null;

    try {
      const appRef = db.collection('appointments').doc(appointmentId);
      await appRef.update({ status: 'completed', callStatus: 'ended', endedAt: admin.firestore.FieldValue.serverTimestamp() });
      console.log(`Marked appointment ${appointmentId} as completed after callSessions ${context.params.sessionId} deletion.`);
    } catch (err) {
      console.error('Error updating appointment after callSessions deletion', err);
    }

    return null;
  });
