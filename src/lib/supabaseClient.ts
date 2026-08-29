// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Reads keys securely from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize client Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side service client for administrative / backend operations
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return supabase;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
