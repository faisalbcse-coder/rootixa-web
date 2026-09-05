import "server-only";

import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://uxvyrqlzhsrizncamjuy.supabase.co";
const DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4dnlycWx6aHNyaXpuY2FtanV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTMzNzU3OSwiZXhwIjoyMTAwOTEzNTc5fQ.5QpspyWC5OIqQUUXJUqhiPmf741De5rldgTwARfHiAQ";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase service client is not configured.");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

