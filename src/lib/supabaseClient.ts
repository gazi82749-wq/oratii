// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://vzbxhxlrmshmtgiocqkh.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhoeGxybXNobXRnaW9jcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDc2NDksImV4cCI6MjA5NjY4MzY0OX0.Ac7OU5VwtKvvdCmIxvzyuilWJYmLz7-qrLq8DVD_x2U';

// Reads keys securely from environment variables with safe defaults for build phase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

// Initialize client Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side service client for administrative / backend operations
// Note: For high-concurrency production deployments (10,000+ RPM), configure NEXT_PUBLIC_SUPABASE_URL
// to use Supabase Supavisor Connection Pooler (Transaction Mode, Port 6543)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    if (typeof window === 'undefined') {
      console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY is missing in server environment. Admin database operations may fail RLS policies.');
    }
    return supabase;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
