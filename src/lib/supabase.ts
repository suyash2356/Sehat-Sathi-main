
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Storage uploads may fail.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseKey || 'placeholder-key'
);

/**
 * Uploads a file to Supabase Storage.
 * @param file The file to upload.
 * @param path The path in the bucket (e.g., 'doctors/123/file.png').
 * @param bucket The bucket name (default: 'uploads').
 * @returns The public URL of the uploaded file.
 */
export const uploadToSupabase = async (file: File, path: string, bucket: string = 'uploads'): Promise<string> => {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase credentials are missing. Please check .env.local");
    }

    // upload file
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        throw error;
    }

    // get public url
    const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicData.publicUrl;
};
