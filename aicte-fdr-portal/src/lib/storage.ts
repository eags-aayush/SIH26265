import { getSupabase } from './supabase';

const BUCKET_NAME = 'fdr-documents';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * Upload an FDR document scan or letter to Supabase Storage bucket ('fdr-documents').
 * Automatically paths files as `<fdr_number>/v<version>_<timestamp>_<clean_filename>`.
 */
export async function uploadFDRDocument(
  file: File,
  fdrNumber: string,
  version: number = 1
): Promise<UploadResult> {
  const supabase = getSupabase();
  if (!supabase) {
    // Return simulated success when running in local demo mode without live Supabase
    return {
      success: true,
      filePath: `simulated/${fdrNumber}/v${version}_${file.name}`,
    };
  }

  try {
    const cleanFdr = fdrNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `${cleanFdr}/v${version}_${Date.now()}_${cleanName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, filePath: data.path };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    return { success: false, error: err.message || 'Upload failed' };
  }
}

/**
 * Generate a secure, time-limited signed URL to view or download a document.
 */
export async function getDocumentDownloadUrl(filePath: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || filePath.startsWith('simulated/')) {
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1-hour expiration

    if (error) {
      console.warn('Error generating signed download URL:', error.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Signed URL generation exception:', err);
    return null;
  }
}
