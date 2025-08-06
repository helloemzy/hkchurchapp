import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * Create a Supabase client for use in Client Components
 * This client automatically handles session management and authentication
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Legacy client for components using the old auth helpers
 * Use createClient() for new components
 */
export const supabase = createClientComponentClient<Database>();

/**
 * Database type definitions will be generated from Supabase
 * Run: npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
 */