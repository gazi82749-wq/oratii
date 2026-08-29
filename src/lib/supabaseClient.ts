// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Reads keys securely from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
