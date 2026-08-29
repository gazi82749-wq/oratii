const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://vzbxhxlrmshmtgiocqkh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhoeGxybXNobXRnaW9jcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDc2NDksImV4cCI6MjA5NjY4MzY0OX0.Ac7OU5VwtKvvdCmIxvzyuilWJYmLz7-qrLq8DVD_x2U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runFix() {
  console.log('Attempting direct database update via Supabase client...');
  
  // Try calling rpc or checking tables
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
  
  if (error) {
    console.log('RPC exec_sql notice:', error.message);
  } else {
    console.log('RPC execution output:', data);
  }
}

runFix();
