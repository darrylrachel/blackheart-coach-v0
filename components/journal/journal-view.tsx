"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { format, parseISO } from "date-fns"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PenSquare, Search, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"]

interface JournalViewProps {
  user: User
  profile: Profile
  journalEntries: JournalEntry[]
}

export function JournalView({ user, profile, journalEntries }: JournalViewProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false)
  const [isEditEntryOpen, setIsEditEntryOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [entryTitle, setEntryTitle] = useState("")
  const [entryContent, setEntryContent] = useState("")
  const [entryMood, setEntryMood] = useState("neutral")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter entries based on search query
  const filteredEntries = journalEntries.filter(
    (entry) =>
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleNewEntry = async () => {
    setIsSubmitting(true)
    try {
      const today = new Date().toISOString().split("T")[0]

      await supabase.from("journal_entries").insert({
        user_id: user.id,
        date: today,
        title: entryTitle,
        content: entryContent,
        mood: entryMood,
      })

      setIsNewEntryOpen(false)
      setEntryTitle("")
      setEntryContent("")
      setEntryMood("neutral")
      router.refresh()
    } catch (error) {
      console.error("Error creating journal entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditEntry = async () => {
    if (!selectedEntry) return

    setIsSubmitting(true)
    try {
      await supabase
        .from("journal_entries")
        .update({
          title: entryTitle,
          content: entryContent,
          mood: entryMood,
        })
        .eq("id", selectedEntry.id)

      setIsEditEntryOpen(false)
      setSelectedEntry(null)
      router.refresh()
    } catch (error) {
      console.error("Error updating journal entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return

    setIsSubmitting(true)
    try {
      await supabase.from("journal_entries").delete().eq("id", selectedEntry.id)

      setIsDeleteDialogOpen(false)
      setSelectedEntry(null)
      router.refresh()
    } catch (error) {
      console.error("Error deleting journal entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setEntryTitle(entry.title || "")
    setEntryContent(entry.content)
    setEntryMood(entry.mood)
    setIsEditEntryOpen(true)
  }

  const openDeleteDialog = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Fitness Journal</h1>
        <p className="text-muted-foreground">Track your thoughts, feelings, and reflections on your fitness journey</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsNewEntryOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Entry
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Entries</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => openEditDialog(entry)}
                onDelete={() => openDeleteDialog(entry)}
              />
            ))
          ) : (
            <EmptyJournalState onNewEntry={() => setIsNewEntryOpen(true)} />
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {filteredEntries.slice(0, 5).length > 0 ? (
            filteredEntries
              .slice(0, 5)
              .map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => openEditDialog(entry)}
                  onDelete={() => openDeleteDialog(entry)}
                />
              ))
          ) : (
            <EmptyJournalState onNewEntry={() => setIsNewEntryOpen(true)} />
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {filteredEntries.filter((entry) => entry.is_favorite).length > 0 ? (
            filteredEntries
              .filter((entry) => entry.is_favorite)
              .map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => openEditDialog(entry)}
                  onDelete={() => openDeleteDialog(entry)}
                />
              ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <PenSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No favorite entries yet</h3>
              <p className="text-muted-foreground mt-1">Mark entries as favorites to see them here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Entry Dialog */}
      <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
            <DialogDescription>
              Record your thoughts, progress, and reflections on your fitness journey.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Entry title"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your thoughts here..."
                className="min-h-[200px]"
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewEntry} disabled={isSubmitting || !entryTitle || !entryContent}>
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditEntryOpen} onOpenChange={setIsEditEntryOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
            <DialogDescription>Update your journal entry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Entry title"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Write your thoughts here..."
                className="min-h-[200px]"
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEntryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEntry} disabled={isSubmitting || !entryTitle || !entryContent}>
              {isSubmitting ? "Updating..." : "Update Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEntry} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface JournalEntryCardProps {
  entry: JournalEntry
  onEdit: () => void
  onDelete: () => void
}

function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{entry.title || "Untitled Entry"}</CardTitle>
            <CardDescription>{format(parseISO(entry.date), "MMMM d, yyyy")}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{entry.content}</p>
      </CardContent>
      <CardFooter className="pt-1">
        <div className="text-xs text-muted-foreground">
          Mood: <span className="capitalize">{entry.mood}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

function EmptyJournalState({ onNewEntry }: { onNewEntry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <PenSquare className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No journal entries yet</h3>
      <p className="text-muted-foreground mt-1">
        Start tracking your fitness journey by creating your first journal entry
      </p>
      <Button onClick={onNewEntry} className="mt-4">
        <Plus className="mr-2 h-4 w-4" /> Create First Entry
      </Button>
    </div>
  )
}
