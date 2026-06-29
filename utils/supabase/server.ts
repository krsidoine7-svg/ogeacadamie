import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const createRawClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};

// Cache the getUser call per-request to avoid redundant network calls to Supabase Cloud Auth
const getCachedUser = cache(async () => {
  const cookieStore = await cookies();
  const client = createRawClient(cookieStore);
  return await client.auth.getUser();
});

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  const client = createRawClient(cookieStore);

  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (jwt?: string) => {
    if (jwt) return originalGetUser(jwt);
    return getCachedUser();
  };

  return client;
};
