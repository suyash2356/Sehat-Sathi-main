import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminAuth } from '@/lib/firebase-admin';

// Initialize Supabase Admin for verifying tokens server-side
// We re-use public variables but in a real secure setup you might use a Service Role Key if needed.
// For simple token verification `getUser(jwt)` works with the Anon key if RLS allows or just standard client check.
// However, to be robust, we verify the user *session*.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { session, role } = await req.json(); // Expecting the full Supabase Session object + optional role

        if (!session || !session.access_token || !session.user) {
            return NextResponse.json({ error: 'Invalid Session' }, { status: 400 });
        }

        // 1. Verify Validity of the Supabase Token/User
        const { data: { user }, error } = await supabase.auth.getUser(session.access_token);

        if (error || !user) {
            return NextResponse.json({ error: 'Supabase Token Invalid' }, { status: 401 });
        }

        // 2. Initialize Firebase Admin
        const adminAuth = getAdminAuth();
        if (!adminAuth) {
            const missing = [];
            if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
            if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
            if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');

            return NextResponse.json({
                error: `Firebase Admin not configured. Missing: ${missing.join(', ')}`
            }, { status: 500 });
        }

        // 3. Mint Firebase Custom Token
        // We use the SAME UID from Supabase to keep them linked 1:1.
        const firebaseUid = user.id;
        const email = user.email || '';

        const additionalClaims: any = {
            isSynced: true,
            provider: 'supabase'
        };

        if (role === 'admin' || email === 'admin@sehatsathi.com') {
            additionalClaims.isAdmin = true;
        }

        if (role === 'doctor') {
            additionalClaims.isDoctor = true;
        }

        const customToken = await adminAuth.createCustomToken(firebaseUid, additionalClaims);

        return NextResponse.json({
            firebaseToken: customToken,
            uid: firebaseUid
        });

    } catch (e: any) {
        console.error("Auth Sync Error:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
