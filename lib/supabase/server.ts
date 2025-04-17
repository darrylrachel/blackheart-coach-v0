import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

export const getSupabaseServer = () => {
  const cookieStore = cookies()
  // const token = cookieStore.get("sb-...")
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}

