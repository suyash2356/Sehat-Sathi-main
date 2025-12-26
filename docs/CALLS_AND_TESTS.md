# Call Flow & Tests

This document explains how to run the Firestore rules unit tests and deploy the Cloud Function for call cleanup, plus a short manual end-to-end test checklist.

## Run Firestore rules unit tests
1. Install deps (root):

```bash
npm install
```

2. Run the rules tests:

```bash
npm run test:rules
```

This uses `@firebase/rules-unit-testing` and `mocha` to verify the `callSessions` creation rules (doctor-only).

## Deploy Cloud Function (cleanup on callSessions delete)
The Cloud Function template is in `functions/index.js`.

1. From repo root, install functions deps and deploy (or use separate `functions` terminal):

```bash
cd functions
npm install
firebase deploy --only functions
```

2. Ensure `firebase-tools` is authenticated and project is set (use `firebase use --add` to set project id).

## Deploy Firestore Security Rules
To deploy the updated `firestore.rules` file:

```bash
firebase deploy --only firestore:rules
```

## Manual end-to-end test checklist
1. Start dev server:

```bash
npm run dev
```

2. As a patient:
   - Book an appointment with a doctor (`timing: scheduled` or `call_now`).
   - Verify `appointments/{id}` created with `status: 'pending'`.

3. As doctor:
   - Accept the appointment (status → `accepted`).
   - When allowed (timing satisfied), click Start Call.
   - Confirm `callSessions/{appointmentId}` is created with `appointmentId`, `doctorId`, `patientId`, `mode`.
   - Doctor should be redirected to `/video-call?sessionId={id}`.

4. As patient:
   - Notification UI should show "Doctor started the call — Join Now".
   - Click Join → redirected to `/video-call?sessionId={id}`.
   - WebRTC connection should establish (audio/video depending on mode).

5. End call from either side:
   - Confirm `callSessions/{id}` is deleted and `appointments/{id}.status` becomes `completed` (Cloud Function will update when deployed).

## Notes
- Firestore rules are enforced in production; run the unit tests locally to verify them before deploying.
- The repo now uses a single entry point for calls: `/video-call?sessionId=` (consolidated to `use-video-call` + `VideoCall`).
- Consider deploying the Cloud Function for robust server-side cleanup.
