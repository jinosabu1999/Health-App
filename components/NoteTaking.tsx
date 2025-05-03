"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Edit, Search, Star, StarOff, FileText, FolderPlus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  favorite: boolean
}

interface NoteTag {
  id: string
  name: string
  color: string
}

export default function NoteTaking() {
  const [notes, setNotes] = useState<Note[]>([])
  const [tags, setTags] = useState<NoteTag[]>([
    { id: "work", name: "Work", color: "bg-blue-500" },
    { id: "personal", name: "Personal", color: "bg-green-500" },
    { id: "ideas", name: "Ideas", color: "bg-purple-500" },
    { id: "tasks", name: "Tasks", color: "bg-amber-500" },
  ])

  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // New note form
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteTags, setNewNoteTags] = useState<string[]>([])

  // Edit note
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // New tag form
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("bg-blue-500")

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes)
        setNotes(
          parsed.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          })),
        )
      } catch (e) {
        console.error("Error loading saved notes:", e)
      }
    }

    const savedTags = localStorage.getItem("note-tags")
    if (savedTags) {
      try {
        setTags(JSON.parse(savedTags))
      } catch (e) {
        console.error("Error loading saved tags:", e)
      }
    }
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  // Save tags to localStorage
  useEffect(() => {
    localStorage.setItem("note-tags", JSON.stringify(tags))
  }, [tags])

  const createNote = () => {
    if (!newNoteTitle.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      tags: newNoteTags,
      createdAt: new Date(),
      updatedAt: new Date(),
      favorite: false,
    }

    setNotes([newNote, ...notes])
    resetNoteForm()
  }

  const updateNote = () => {
    if (!editingNote || !editingNote.title.trim()) return

    setNotes(
      notes.map((note) =>
        note.id === editingNote.id
          ? {
              ...editingNote,
              updatedAt: new Date(),
            }
          : note,
      ),
    )

    setEditingNote(null)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const toggleFavorite = (id: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              favorite: !note.favorite,
              updatedAt: new Date(),
            }
          : note,
      ),
    )
  }

  const createTag = () => {
    if (!newTagName.trim()) return

    const newTag: NoteTag = {
      id: newTagName.toLowerCase().replace(/\s+/g, "-"),
      name: newTagName,
      color: newTagColor,
    }

    setTags([...tags, newTag])
    setNewTagName("")
    setIsCreatingTag(false)
  }

  const resetNoteForm = () => {
    setNewNoteTitle("")
    setNewNoteContent("")
    setNewNoteTags([])
    setIsCreating(false)
  }

  const toggleTagSelection = (tagId: string) => {
    setNewNoteTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const getTagById = (id: string) => {
    return tags.find((tag) => tag.id === id) || { id, name: id, color: "bg-gray-500" }
  }

  const filteredNotes = notes.filter((note) => {
    // Filter by tab
    if (activeTab === "favorites" && !note.favorite) return false

    // Filter by search query
    if (
      searchQuery &&
      !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false

    // Filter by selected tags
    if (selectedTags.length > 0 && !selectedTags.some((tagId) => note.tags.includes(tagId))) return false

    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>Create and organize your notes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setIsCreating(true)} className="flex-shrink-0">
            <Plus className="mr-2 h-4 w-4" /> New Note
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground flex items-center">
            <Filter className="h-4 w-4 mr-1" /> Filter:
          </span>
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                selectedTags.includes(tag.id) && tag.color,
                selectedTags.includes(tag.id) && "text-white",
              )}
              onClick={() => toggleTagFilter(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedTags([])}>
              Clear
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No notes found</h3>
            <p className="text-muted-foreground mt-2">Create a new note to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg">{note.title}</h3>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleFavorite(note.id)}>
                        {note.favorite ? (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{note.content}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tagId) => {
                        const tag = getTagById(tagId)
                        return (
                          <Badge
                            key={tagId}
                            variant="outline"
                            className={cn("text-xs", tag.color, "bg-opacity-15 border-opacity-30")}
                          >
                            {tag.name}
                          </Badge>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Updated {note.updatedAt.toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingNote(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Tag Dialog */}
        <Dialog open={isCreatingTag} onOpenChange={setIsCreatingTag}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tag</DialogTitle>
              <DialogDescription>Add a new tag to organize your notes</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="E.g., Project"
                />
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-amber-500",
                    "bg-red-500",
                    "bg-indigo-500",
                    "bg-pink-500",
                    "bg-emerald-500",
                  ].map((color) => (
                    <div
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full cursor-pointer border-2",
                        color,
                        newTagColor === color ? "border-primary" : "border-transparent",
                      )}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatingTag(false)}>
                Cancel
              </Button>
              <Button onClick={createTag}>Create Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Note Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
              <DialogDescription>Add a new note to your collection</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="min-h-[150px]"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Tags</Label>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setIsCreatingTag(true)}>
                    <FolderPlus className="h-3 w-3 mr-1" /> New Tag
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={newNoteTags.includes(tag.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer",
                        newNoteTags.includes(tag.id) && tag.color,
                        newNoteTags.includes(tag.id) && "text-white",
                      )}
                      onClick={() => toggleTagSelection(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetNoteForm}>
                Cancel
              </Button>
              <Button onClick={createNote} disabled={!newNoteTitle.trim()}>
                Create Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>Update your note</DialogDescription>
            </DialogHeader>
            {editingNote && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-note-title">Title</Label>
                  <Input
                    id="edit-note-title"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    placeholder="Note title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-note-content">Content</Label>
                  <Textarea
                    id="edit-note-content"
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    placeholder="Write your note here..."
                    className="min-h-[150px]"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Tags</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setIsCreatingTag(true)}
                    >
                      <FolderPlus className="h-3 w-3 mr-1" /> New Tag
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={editingNote.tags.includes(tag.id) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer",
                          editingNote.tags.includes(tag.id) && tag.color,
                          editingNote.tags.includes(tag.id) && "text-white",
                        )}
                        onClick={() =>
                          setEditingNote({
                            ...editingNote,
                            tags: editingNote.tags.includes(tag.id)
                              ? editingNote.tags.filter((id) => id !== tag.id)
                              : [...editingNote.tags, tag.id],
                          })
                        }
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={updateNote} disabled={!editingNote?.title.trim()}>
                Update Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
