import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Upgrading users with <= 5 credits to 10 credits...');
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ credits: 10 })
    .lte('credits', 5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Successfully upgraded users!');
  }
}

main();
