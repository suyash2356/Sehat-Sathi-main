import * as admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

function getServiceAccount() {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) return null;

    return { projectId, clientEmail, privateKey };
}

export function initAdminIfNeeded() {
    if (adminApp) return adminApp;
    const svc = getServiceAccount();
    if (!svc) {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        console.warn('Skipping Firebase admin initialization. Missing vars:', {
            hasProjectId: !!projectId,
            hasClientEmail: !!clientEmail,
            hasPrivateKey: !!privateKey
        });
        return null;
    }

    try {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(svc as any),
        });
        return adminApp;
    } catch (error) {
        console.error('Firebase admin initialization error', error);
        return null;
    }
}

export function getAdminAuth() {
    const app = initAdminIfNeeded();
    if (!app) return null;
    return admin.auth(app);
}

export function getAdminDb() {
    const app = initAdminIfNeeded();
    if (!app) return null;
    return admin.firestore(app);
}

export function isAdminAvailable() {
    return !!initAdminIfNeeded();
}
