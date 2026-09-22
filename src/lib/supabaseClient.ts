import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Reads keys securely from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize client Supabase instance with cookie synchronization for server middleware
export const supabase = typeof window !== 'undefined'
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : createClient(supabaseUrl, supabaseAnonKey);

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

// Returns service role client if key is configured, or scoped authenticated user client using bearer token
export const getTrainerDbClient = (token?: string) => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabase;
};

