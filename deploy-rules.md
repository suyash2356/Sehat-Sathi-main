# Deploy Firestore Rules

To fix the Firebase permission error, you need to deploy the updated Firestore rules:

## Option 1: Using Firebase CLI

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init firestore
```

4. Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

## Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database > Rules
4. Replace the rules with the content from `firestore.rules`
5. Click "Publish"

## Option 3: Temporary Fix (For Demo)

If you can't deploy rules immediately, you can temporarily disable authentication in your Firebase project:

1. Go to Firebase Console
2. Go to Authentication > Sign-in method
3. Disable all sign-in methods temporarily
4. This will allow the demo to work without authentication

**Note**: Remember to re-enable authentication and deploy proper rules for production!
