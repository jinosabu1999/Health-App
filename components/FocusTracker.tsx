"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause, BarChart4, Calendar, Clock, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Progress } from "@/components/ui/progress"

// Chart components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart"

interface FocusSession {
  id: string
  task: string
  category: string
  started: Date
  ended: Date | null
  duration: number // in seconds
  completed: boolean
}

interface Category {
  id: string
  name: string
  color: string
}

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "Work", color: "bg-blue-500" },
  { id: "study", name: "Study", color: "bg-purple-500" },
  { id: "personal", name: "Personal", color: "bg-green-500" },
  { id: "health", name: "Health", color: "bg-red-500" },
]

export default function FocusTracker() {
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [activeTab, setActiveTab] = useState("tracker")
  const [pausedSessions, setPausedSessions] = useState<FocusSession[]>([])

  // Form states
  const [newTask, setNewTask] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || "")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("bg-emerald-500")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)

  // Stats
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ name: string; value: number }[]>([])

  // Load sessions from localStorage on initial render
  useEffect(() => {
    const savedSessions = localStorage.getItem("focus-sessions")
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        setSessions(
          parsed.map((session: any) => ({
            ...session,
            started: new Date(session.started),
            ended: session.ended ? new Date(session.ended) : null,
          })),
        )
      } catch (e) {
        console.error("Error loading saved sessions:", e)
      }
    }

    const savedCategories = localStorage.getItem("focus-categories")
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories))
      } catch (e) {
        console.error("Error loading saved categories:", e)
      }
    }

    const savedPausedSessions = localStorage.getItem("focus-paused-sessions")
    if (savedPausedSessions) {
      try {
        const parsed = JSON.parse(savedPausedSessions)
        setPausedSessions(
          parsed.map((session: any) => ({
            ...session,
            started: new Date(session.started),
            ended: session.ended ? new Date(session.ended) : null,
          })),
        )
      } catch (e) {
        console.error("Error loading saved paused sessions:", e)
      }
    }
  }, [])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("focus-sessions", JSON.stringify(sessions))
  }, [sessions])

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("focus-categories", JSON.stringify(categories))
  }, [categories])

  // Save paused sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("focus-paused-sessions", JSON.stringify(pausedSessions))
  }, [pausedSessions])

  // Update timer for active session
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (activeSession) {
      interval = setInterval(() => {
        const now = new Date()
        const startTime = activeSession.started.getTime()
        const elapsed = Math.floor((now.getTime() - startTime) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeSession])

  // Calculate stats
  useEffect(() => {
    // Total focus time
    const total = sessions.reduce((acc, session) => {
      return acc + (session.completed ? session.duration : 0)
    }, 0)
    setTotalFocusTime(total)

    // Completion rate
    const completed = sessions.filter((s) => s.completed).length
    setCompletionRate(sessions.length > 0 ? (completed / sessions.length) * 100 : 0)

    // Category breakdown
    const breakdown: Record<string, number> = {}
    sessions.forEach((session) => {
      if (session.completed) {
        breakdown[session.category] = (breakdown[session.category] || 0) + session.duration
      }
    })

    const categoryBreakdownData = Object.entries(breakdown).map(([catId, duration]) => {
      const category = categories.find((c) => c.id === catId)
      return {
        name: category?.name || catId,
        value: duration / 60, // Convert to minutes
      }
    })
    setCategoryBreakdown(categoryBreakdownData)
  }, [sessions, categories])

  // Calculate weekly data for chart
  const getWeeklyData = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Create an array with the last 7 days
    const days: string[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      days.push(day.toLocaleDateString("en-US", { weekday: "short" }))
    }

    // Initialize data with 0 minutes for each day
    const data = days.map((day) => ({ day, minutes: 0 }))

    // Add session durations
    sessions.forEach((session) => {
      if (session.completed && new Date(session.ended as Date) >= oneWeekAgo) {
        const sessionDay = new Date(session.ended as Date).toLocaleDateString("en-US", { weekday: "short" })
        const dayIndex = data.findIndex((d) => d.day === sessionDay)
        if (dayIndex !== -1) {
          data[dayIndex].minutes += session.duration / 60
        }
      }
    })

    return data
  }

  const startSession = () => {
    if (!newTask || !selectedCategory) return

    const session: FocusSession = {
      id: Date.now().toString(),
      task: newTask,
      category: selectedCategory,
      started: new Date(),
      ended: null,
      duration: 0,
      completed: false,
    }

    setActiveSession(session)
    setNewTask("")
  }

  const pauseSession = () => {
    if (!activeSession) return

    const now = new Date()
    const duration = Math.floor((now.getTime() - activeSession.started.getTime()) / 1000)

    const pausedSession: FocusSession = {
      ...activeSession,
      ended: now,
      duration,
      completed: false,
    }

    setPausedSessions([pausedSession, ...pausedSessions])
    setActiveSession(null)
    setElapsedTime(0)
  }

  const resumeSession = (session: FocusSession) => {
    // Create a new session with the same task and category
    const newSession: FocusSession = {
      id: Date.now().toString(),
      task: session.task,
      category: session.category,
      started: new Date(),
      ended: null,
      duration: 0,
      completed: false,
    }

    // Remove from paused sessions
    setPausedSessions(pausedSessions.filter((s) => s.id !== session.id))

    // Set as active session
    setActiveSession(newSession)
    setActiveTab("tracker")
  }

  const completeSession = () => {
    if (!activeSession) return

    const now = new Date()
    const duration = Math.floor((now.getTime() - activeSession.started.getTime()) / 1000)

    const completedSession: FocusSession = {
      ...activeSession,
      ended: now,
      duration,
      completed: true,
    }

    setSessions([completedSession, ...sessions])
    setActiveSession(null)
    setElapsedTime(0)
  }

  const deleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id))
    setPausedSessions(pausedSessions.filter((s) => s.id !== id))
  }

  const createCategory = () => {
    if (!newCategoryName) return

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      color: newCategoryColor,
    }

    setCategories([...categories, newCategory])
    setNewCategoryName("")
    setShowCategoryDialog(false)
  }

  const deleteCategory = (id: string) => {
    // Don't delete default categories or categories in use
    if (DEFAULT_CATEGORIES.some((c) => c.id === id) || sessions.some((s) => s.category === id)) return

    setCategories(categories.filter((c) => c.id !== id))
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatShortDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id) || { id, name: "Unknown", color: "bg-gray-500" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Tracker</CardTitle>
        <CardDescription>Track your focus sessions and analyze your productivity</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="space-y-4">
            {activeSession ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-3">
                  <Badge
                    className={cn(
                      "px-3 py-1",
                      getCategoryById(activeSession.category).color,
                      "bg-opacity-20 border-opacity-30",
                    )}
                  >
                    {getCategoryById(activeSession.category).name}
                  </Badge>
                  <h3 className="text-xl font-semibold">{activeSession.task}</h3>
                  <div className="text-4xl font-bold tabular-nums mt-2">{formatDuration(elapsedTime)}</div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button onClick={pauseSession} variant="outline" className="flex items-center gap-2">
                    <Pause size={16} />
                    Pause
                  </Button>
                  <Button onClick={completeSession} className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Complete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task">What are you focusing on?</Label>
                  <Input
                    id="task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="E.g., Write a report"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <div className="flex space-x-2">
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCategoryDialog(true)}
                      aria-label="Add new category"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <Button className="w-full mt-4" onClick={startSession} disabled={!newTask || !selectedCategory}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Focus Session
                </Button>

                {pausedSessions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Paused Sessions</h3>
                    <div className="space-y-3">
                      {pausedSessions.map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "p-3 rounded-lg border flex items-center justify-between",
                            getCategoryById(session.category).color,
                            "bg-opacity-10 border-opacity-20",
                          )}
                        >
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {getCategoryById(session.category).name}
                            </Badge>
                            <p className="font-medium">{session.task}</p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {formatShortDuration(session.duration)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => resumeSession(session)}>
                              <Play className="h-3 w-3 mr-1" /> Resume
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteSession(session.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No focus sessions yet</h3>
                <p className="text-muted-foreground mt-2">Start a new focus session to track your productivity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-lg border",
                      getCategoryById(session.category).color,
                      "bg-opacity-10 border-opacity-20",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{getCategoryById(session.category).name}</Badge>
                          {session.completed ? (
                            <Badge variant="default" className="bg-green-500">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline">Paused</Badge>
                          )}
                        </div>
                        <h4 className="text-lg font-medium mt-2">{session.task}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(session.started).toLocaleString()} • {formatShortDuration(session.duration)}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteSession(session.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatShortDuration(totalFocusTime)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
                  <Progress value={completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Focus</CardTitle>
                <CardDescription>Your focus time over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      minutes: {
                        label: "Minutes",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getWeeklyData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip content={(props) => <ChartTooltipContent {...props} />} />
                        <Line
                          type="monotone"
                          dataKey="minutes"
                          stroke="var(--color-minutes)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Time spent on each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{category.name}</span>
                        <span className="font-medium">{formatShortDuration(category.value * 60)}</span>
                      </div>
                      <Progress
                        value={category.value}
                        max={Math.max(...categoryBreakdown.map((c) => c.value)) * 1.2}
                        className={cn(
                          getCategoryById(categories.find((c) => c.name === category.name)?.id || "")?.color.replace(
                            "bg-",
                            "bg-opacity-80 ",
                          ),
                        )}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new category to organize your focus sessions</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="E.g., Creative"
              />
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-green-500",
                  "bg-red-500",
                  "bg-amber-500",
                  "bg-indigo-500",
                  "bg-pink-500",
                  "bg-emerald-500",
                ].map((color) => (
                  <div
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer border-2",
                      color,
                      newCategoryColor === color ? "border-primary" : "border-transparent",
                    )}
                    onClick={() => setNewCategoryColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
