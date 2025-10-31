
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Creates a Supabase client for server-side operations.
 * It uses the NEXT_PUBLIC_ prefixed environment variables, which are available
 * in both the browser and serverless function environments on platforms like Vercel.
 * This simplifies configuration by using a single set of variables for both client and server.
 */
export const createServerClient = (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // This error will be shown in the server logs if the variables are missing.
    throw new Error('Missing Supabase public configuration environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  }

  return createPagesServerClient({ req, res }, {
    supabaseUrl,
    supabaseKey,
  });
};
