import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    // 1. Get the current user session (needs to be sent from client, so we'll do an alternative: we'll just let the user hit this from the browser if they are logged in)
    // Wait, since it's a server route and we are using client-side auth in this app (as seen in layout), the server might not have the session.
    // Let's return a simple HTML page that runs the client-side code to upgrade them.
    
    return new NextResponse(`
      <html>
        <body>
          <h2>Upgrading your account to Admin...</h2>
          <script type="module">
            import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
            
            const supabaseUrl = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
            const supabaseKey = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
            const supabase = createClient(supabaseUrl, supabaseKey);

            async function makeAdmin() {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                document.body.innerHTML = '<h2>You are not logged in! Please log in first, then visit this page again.</h2>';
                return;
              }

              const userId = session.user.id;
              const userEmail = session.user.email;

              // Try to insert first in case they don't exist
              await supabase.from('profiles').insert([
                { id: userId, email: userEmail, role: 'admin' }
              ]);

              // Then update just in case they already exist
              const { error } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', userId);

              if (error) {
                document.body.innerHTML = '<h2>Error making you an admin: ' + error.message + '</h2>';
              } else {
                document.body.innerHTML = '<h2>Success! You are now an Admin. Redirecting you to the Admin Panel...</h2>';
                setTimeout(() => {
                  window.location.href = '/admin';
                }, 2000);
              }
            }

            makeAdmin();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' });
  }
}
