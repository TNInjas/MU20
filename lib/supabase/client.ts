import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://elzegnmjiviemrpcwzgm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsemVnbm1qaXZpZW1ycGN3emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDk2NzAsImV4cCI6MjA3NzIyNTY3MH0.u-oJ_8s_IbPmsoadwDWV6H5k2pqbIsNXiLYXI8A0He0';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof document === 'undefined') {
          return [];
        }
        return document.cookie.split(';').map(cookie => {
          const [name, ...rest] = cookie.split('=');
          return { name: name.trim(), value: rest.join('=') };
        });
      },
      setAll(cookiesToSet) {
        if (typeof document === 'undefined') {
          return;
        }
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge};` : ''} ${options?.sameSite ? `sameSite=${options.sameSite};` : ''} ${options?.secure ? 'secure;' : ''}`;
        });
      },
    },
  });
}

