import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { JournalView } from "@/components/journal/journal-view"

export default async function JournalPage() {
  const supabase = getSupabaseServer()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/onboarding")
  }

  // Get journal entries (most recent first)
  const { data: journalEntries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(50)

  return <JournalView user={user} profile={profile} journalEntries={journalEntries || []} />
}
