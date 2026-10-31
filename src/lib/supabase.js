import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabaseConfig = (() => {
  if (
    !supabaseUrl?.trim()
    || !supabaseAnonKey?.trim()
    || supabaseUrl.includes('your-project.supabase.co')
    || supabaseAnonKey.includes('your-supabase-publishable-or-anon-key')
  ) {
    return false;
  }

  try {
    return ['http:', 'https:'].includes(new URL(supabaseUrl.trim()).protocol);
  } catch {
    return false;
  }
})();

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;
