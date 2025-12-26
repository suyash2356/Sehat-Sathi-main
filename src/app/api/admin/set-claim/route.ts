import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const adminAuth = getAdminAuth();
        if (!adminAuth) {
            return NextResponse.json(
                { success: false, error: 'Firebase admin not configured in this environment' },
                { status: 500 }
            );
        }

        const { uid, email, secret } = await request.json();

        // Verification: Bootstrap using hardcoded email OR a secret environment variable
        const ADMIN_EMAIL = 'admin@sehatsathi.com';
        const BOOTSTRAP_SECRET = process.env.ADMIN_BOOTSTRAP_SECRET;

        if (email === ADMIN_EMAIL || (secret && secret === BOOTSTRAP_SECRET)) {
            await adminAuth.setCustomUserClaims(uid, { isAdmin: true });
            console.log(`Successfully set admin claim for user: ${email}`);
            return NextResponse.json({ success: true, message: 'Custom claim set successfully' });
        }

        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    } catch (error: any) {
        console.error('Error setting custom claim:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
