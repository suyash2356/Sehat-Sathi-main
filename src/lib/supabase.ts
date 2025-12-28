import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Supabase features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload helper for Supabase Storage
 */
export async function uploadToSupabase(file: File, path: string, bucket: string = 'uploads') {
    if (!supabaseUrl) throw new Error("Supabase not configured");

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

    if (error) {
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
}
