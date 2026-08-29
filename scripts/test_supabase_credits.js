const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vzbxhxlrmshmtgiocqkh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhoeGxybXNobXRnaW9jcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDc2NDksImV4cCI6MjA5NjY4MzY0OX0.Ac7OU5VwtKvvdCmIxvzyuilWJYmLz7-qrLq8DVD_x2U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('Fetching profiles table columns...');
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  
  if (error) {
    console.error('Supabase query error:', error);
  } else {
    console.log('Profiles table sample row:', data);
  }
}

testSupabase();
