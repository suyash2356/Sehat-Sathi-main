const fs = require('fs');
const assert = require('assert');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');

const PROJECT_ID = 'sehat-sathi-test';

describe('Firestore security rules', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8')
      }
    });

    // Seed an appointment doc where doctorId == 'doctor_abc' and patientId == 'patient_xyz'
    const admin = testEnv.unauthenticatedContext().firestore();
    await admin.collection('appointments').doc('appt123').set({
      doctorId: 'doctor_abc',
      patientId: 'patient_xyz',
      status: 'accepted',
      mode: 'video'
    });
  });

  after(async () => {
    await testEnv.clearFirestore();
    await testEnv.cleanup();
  });

  it('allows doctor to create callSessions for their appointment', async () => {
    const doctorContext = testEnv.authenticatedContext('doctor_abc');
    const db = doctorContext.firestore();

    const sessionRef = db.collection('callSessions').doc('appt123');
    await assertSucceeds(sessionRef.set({ appointmentId: 'appt123', doctorId: 'doctor_abc', patientId: 'patient_xyz', mode: 'video', createdAt: new Date().toISOString() }));
  });

  it('denies patient from creating callSessions', async () => {
    const patientContext = testEnv.authenticatedContext('patient_xyz');
    const db = patientContext.firestore();

    const sessionRef = db.collection('callSessions').doc('appt123-patient');
    await assertFails(sessionRef.set({ appointmentId: 'appt123-patient', doctorId: 'doctor_abc', patientId: 'patient_xyz', mode: 'video', createdAt: new Date().toISOString() }));
  });

});
