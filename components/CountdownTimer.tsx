"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Plus,
  Edit2,
  Check,
  X,
  Trash2,
  Bell,
  Coffee,
  Brain,
  Dumbbell,
  Utensils,
} from "lucide-react"
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface Timer {
  id: string
  hours: number
  minutes: number
  seconds: number
  totalTime: number
  initialTime: number
  isPaused: boolean
  isFinished: boolean
  name?: string
  color?: string
  isEditing?: boolean
  editedHours?: number
  editedMinutes?: number
  editedSeconds?: number
}

interface Preset {
  id: string
  name: string
  duration: number
  icon: React.ComponentType<{ className?: string; size?: number }>
  color?: string
}

// Default presets
const DEFAULT_PRESETS: Preset[] = [
  { id: "pomodoro", name: "Pomodoro", duration: 1500, icon: Brain, color: "bg-red-500" },
  { id: "short-break", name: "Short Break", duration: 300, icon: Coffee, color: "bg-blue-500" },
  { id: "long-break", name: "Long Break", duration: 900, icon: Coffee, color: "bg-indigo-500" },
  { id: "exercise", name: "Exercise", duration: 1800, icon: Dumbbell, color: "bg-green-500" },
  { id: "meal", name: "Meal Time", duration: 1200, icon: Utensils, color: "bg-amber-500" },
]

const NOTIFICATION_SOUNDS = [
  {
    id: "bell",
    name: "Bell",
    url: "/sounds/bell.mp3",
    fallbackUrl: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  },
  {
    id: "chime",
    name: "Chime",
    url: "/sounds/chime.mp3",
    fallbackUrl: "https://assets.mixkit.co/active_storage/sfx/1822/1822-preview.mp3",
  },
  {
    id: "alert",
    name: "Alert",
    url: "/sounds/alert.mp3",
    fallbackUrl: "https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3",
  },
  {
    id: "success",
    name: "Success",
    url: "/sounds/success.mp3",
    fallbackUrl: "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3",
  },
]

export default function CountdownTimer() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("timers")
  const [selectedSound, setSelectedSound] = useState<string>("bell")
  const [soundLoaded, setSoundLoaded] = useState(false)

  // For the New Preset Dialog
  const [newPresetName, setNewPresetName] = useState("")
  const [newPresetHours, setNewPresetHours] = useState(0)
  const [newPresetMinutes, setNewPresetMinutes] = useState(25)
  const [newPresetSeconds, setNewPresetSeconds] = useState(0)
  const [newPresetColor, setNewPresetColor] = useState("bg-purple-500")

  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Test sound functionality
  const testSound = () => {
    if (soundEnabled) {
      playSound(selectedSound)
      toast({
        title: "Playing sound",
        description: `Testing ${NOTIFICATION_SOUNDS.find((s) => s.id === selectedSound)?.name || selectedSound} sound`,
      })
    } else {
      toast({
        title: "Sound is muted",
        description: "Enable sound to hear timer notifications",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (timers.length === 0) {
      createTimer(1500, "Pomodoro", "bg-red-500")
    }
  }, [timers.length])

  // Initialize audio elements
  useEffect(() => {
    // Create audio context to check if audio is available
    let audioContext
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn("Web Audio API not supported in this browser")
    }

    // Function to load a single sound with fallback and error handling
    const loadSound = async (sound: { id: string; name: string; url: string; fallbackUrl: string }) => {
      const audio = new Audio()

      // First try loading from the primary URL
      audio.src = sound.url

      // Set up error handling
      const handleError = async (e: Event) => {
        console.warn(`Error loading sound ${sound.id} from primary URL:`, e)

        // Try the fallback URL if primary fails
        try {
          console.log(`Trying fallback URL for ${sound.id}`)
          audio.src = sound.fallbackUrl

          // Wait for the fallback to load or fail
          await new Promise((resolve, reject) => {
            audio.oncanplaythrough = resolve
            audio.onerror = reject
          })

          console.log(`Successfully loaded ${sound.id} from fallback URL`)
        } catch (fallbackError) {
          console.error(`Failed to load ${sound.id} from fallback URL:`, fallbackError)
          toast({
            title: "Sound Loading Error",
            description: `Could not load ${sound.name} sound. Sound notifications may not work.`,
            variant: "destructive",
          })
        }
      }

      // Set up event listeners
      audio.onerror = handleError

      try {
        // Wait for the sound to load
        await new Promise((resolve) => {
          audio.oncanplaythrough = resolve

          // Set a timeout in case the event never fires
          setTimeout(resolve, 3000)
        })

        console.log(`Sound ${sound.id} loaded successfully`)
      } catch (e) {
        console.warn(`Timeout or error loading ${sound.id}:`, e)
      }

      // Store the audio element
      audioRefs.current[sound.id] = audio
    }

    // Load all sounds
    const loadAllSounds = async () => {
      try {
        await Promise.all(NOTIFICATION_SOUNDS.map(loadSound))
        setSoundLoaded(true)
      } catch (e) {
        console.error("Error loading sounds:", e)
        setSoundLoaded(false)
      }
    }

    loadAllSounds()

    return () => {
      // Clean up audio elements
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause()
        audio.src = ""
      })

      Object.values(intervalRefs.current).forEach(clearInterval)
    }
  }, [])

  const createTimer = (duration = 0, name?: string, color?: string) => {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60

    const newTimer: Timer = {
      id: Date.now().toString(),
      hours,
      minutes,
      seconds,
      totalTime: duration,
      initialTime: duration,
      isPaused: true,
      isFinished: false,
      name,
      color,
      isEditing: false,
      editedHours: hours,
      editedMinutes: minutes,
      editedSeconds: seconds,
    }
    setTimers((prev) => [...prev, newTimer])
    setSelectedPreset(null)
  }

  const createPresetTimer = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      createTimer(preset.duration, preset.name, preset.color)
      setSelectedPreset(preset.id)
    }
  }

  const startTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) => (timer.id === id ? { ...timer, isPaused: false, isEditing: false } : timer)),
    )

    intervalRefs.current[id] = setInterval(() => {
      setTimers((prev) => {
        const timerIndex = prev.findIndex((t) => t.id === id)
        if (timerIndex === -1) return prev

        const timer = prev[timerIndex]
        if (timer.totalTime <= 1) {
          clearInterval(intervalRefs.current[id])

          // Play sound when timer completes
          if (soundEnabled) {
            playSound(selectedSound)
            toast({
              title: "Timer Complete",
              description: `Your ${timer.name || "timer"} has finished!`,
            })
          }

          // Vibrate if enabled
          if (vibrationEnabled) {
            try {
              window.navigator.vibrate([200, 100, 200])
            } catch (error) {
              console.error("Vibration API not supported")
            }
          }

          // Show notification if supported
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Timer Complete", {
              body: `Your ${timer.name || "timer"} has finished!`,
              icon: "/favicon.ico",
            })
          } else if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission()
          }

          const newTimers = [...prev]
          newTimers[timerIndex] = { ...timer, totalTime: 0, isFinished: true, isPaused: true }
          return newTimers
        }

        const newTimers = [...prev]
        newTimers[timerIndex] = { ...timer, totalTime: timer.totalTime - 1 }
        return newTimers
      })
    }, 1000)
  }

  const pauseTimer = (id: string) => {
    clearInterval(intervalRefs.current[id])
    setTimers((prev) => prev.map((timer) => (timer.id === id ? { ...timer, isPaused: true } : timer)))
  }

  const resetTimer = (id: string) => {
    clearInterval(intervalRefs.current[id])
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              totalTime: timer.initialTime,
              isPaused: true,
              isFinished: false,
              isEditing: false,
            }
          : timer,
      ),
    )
  }

  const toggleEdit = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          return {
            ...timer,
            isEditing: !timer.isEditing,
            // Initialize edited values when entering edit mode
            editedHours: timer.hours,
            editedMinutes: timer.minutes,
            editedSeconds: timer.seconds,
          }
        }
        return timer
      }),
    )
  }

  const updateEditedValues = (id: string, field: "hours" | "minutes" | "seconds", value: number) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          return {
            ...timer,
            [`edited${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
          }
        }
        return timer
      }),
    )
  }

  const saveEditedTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          const hours = timer.editedHours || 0
          const minutes = timer.editedMinutes || 0
          const seconds = timer.editedSeconds || 0
          const totalTime = hours * 3600 + minutes * 60 + seconds

          return {
            ...timer,
            hours,
            minutes,
            seconds,
            totalTime,
            initialTime: totalTime,
            isEditing: false,
            isPaused: true,
            isFinished: false,
          }
        }
        return timer
      }),
    )
  }

  const cancelEdit = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          return {
            ...timer,
            isEditing: false,
          }
        }
        return timer
      }),
    )
  }

  const deleteTimer = (id: string) => {
    clearInterval(intervalRefs.current[id])
    setTimers((prev) => prev.filter((timer) => timer.id !== id))
  }

  const createNewPreset = () => {
    const duration = newPresetHours * 3600 + newPresetMinutes * 60 + newPresetSeconds
    if (duration === 0 || !newPresetName) return

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
      duration,
      icon: Bell,
      color: newPresetColor,
    }

    setPresets([...presets, newPreset])

    // Reset form
    setNewPresetName("")
    setNewPresetHours(0)
    setNewPresetMinutes(25)
    setNewPresetSeconds(0)
  }

  const deletePreset = (id: string) => {
    // Don't delete default presets
    if (DEFAULT_PRESETS.some((p) => p.id === id)) return

    setPresets(presets.filter((p) => p.id !== id))
  }

  // Improved sound playing function
  const playSound = (soundId: string) => {
    try {
      if (!soundLoaded) {
        console.warn("Sounds not yet loaded")
        toast({
          title: "Sound Not Ready",
          description: "Sound effects are still loading. Please try again in a moment.",
          variant: "destructive",
        })
        return
      }

      const audio = audioRefs.current[soundId]
      if (!audio) {
        console.error(`Sound ${soundId} not found in refs`)
        toast({
          title: "Sound Error",
          description: "The selected sound could not be played.",
          variant: "destructive",
        })
        return
      }

      // Create a clone of the audio element to avoid overlapping plays
      const audioClone = new Audio()
      audioClone.src = audio.src
      audioClone.volume = 1.0

      // Play the sound with a promise and error handling
      const playPromise = audioClone.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Playing ${soundId} sound`)
            toast({
              title: "Sound Test",
              description: `Playing ${NOTIFICATION_SOUNDS.find((s) => s.id === soundId)?.name || soundId} sound`,
            })
          })
          .catch((error) => {
            console.error(`Error playing sound ${soundId}:`, error)
            toast({
              title: "Sound Playback Error",
              description: "Could not play the sound. This may be due to browser restrictions.",
              variant: "destructive",
            })
          })
      }
    } catch (error) {
      console.error("Error in playSound function:", error)
      toast({
        title: "Sound System Error",
        description: "There was a problem with the sound system.",
        variant: "destructive",
      })
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = time % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Countdown Timer</CardTitle>
        <CardDescription>Track time with customizable timers and presets</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="timers">Timers</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="timers" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {/* Sound controls group */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={soundEnabled ? "default" : "outline"}
                    size="icon"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? "Mute sound" : "Enable sound"}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </Button>

                  <Button
                    variant={vibrationEnabled ? "default" : "outline"}
                    size="icon"
                    onClick={() => setVibrationEnabled(!vibrationEnabled)}
                    title={vibrationEnabled ? "Disable vibration" : "Enable vibration"}
                  >
                    <Vibrate size={16} />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={selectedSound} onValueChange={setSelectedSound}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select a sound" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_SOUNDS.map((sound) => (
                        <SelectItem key={sound.id} value={sound.id}>
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <span>{sound.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" onClick={testSound} title="Test selected sound">
                    Test
                  </Button>
                </div>
              </div>

              {/* Add timer button */}
              <Button onClick={() => createTimer()} className="shrink-0" title="Add new timer">
                <Plus className="mr-2 h-4 w-4" /> Add Timer
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {timers.map((timer) => (
                  <motion.div
                    key={timer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      "relative p-6 rounded-lg border shadow-sm",
                      timer.color ? `${timer.color} bg-opacity-10 border-opacity-20` : "bg-card",
                    )}
                  >
                    {timer.name && (
                      <div className="absolute top-4 left-4 text-sm font-medium">
                        <Badge variant="outline">{timer.name}</Badge>
                      </div>
                    )}
                    <div className="relative aspect-square max-w-[200px] mx-auto">
                      {timer.isEditing ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              value={timer.editedHours}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(99, Number.parseInt(e.target.value) || 0))
                                updateEditedValues(timer.id, "hours", value)
                              }}
                              className="w-16 p-2 text-center rounded-md border border-input bg-background"
                              placeholder="HH"
                              min="0"
                              max="99"
                            />
                            <input
                              type="number"
                              value={timer.editedMinutes}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(59, Number.parseInt(e.target.value) || 0))
                                updateEditedValues(timer.id, "minutes", value)
                              }}
                              className="w-16 p-2 text-center rounded-md border border-input bg-background"
                              placeholder="MM"
                              min="0"
                              max="59"
                            />
                            <input
                              type="number"
                              value={timer.editedSeconds}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(59, Number.parseInt(e.target.value) || 0))
                                updateEditedValues(timer.id, "seconds", value)
                              }}
                              className="w-16 p-2 text-center rounded-md border border-input bg-background"
                              placeholder="SS"
                              min="0"
                              max="59"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-secondary"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray={`${(timer.totalTime / timer.initialTime) * 283} 283`}
                              className={cn(
                                "transition-all duration-1000",
                                timer.isFinished
                                  ? "text-destructive"
                                  : timer.color
                                    ? `${timer.color.replace("bg-", "text-")}`
                                    : "text-primary",
                              )}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl md:text-3xl font-bold tabular-nums">
                              {formatTime(timer.totalTime)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                      {timer.isEditing ? (
                        <>
                          <Button variant="destructive" size="icon" onClick={() => cancelEdit(timer.id)} title="Cancel">
                            <X size={16} />
                          </Button>
                          <Button size="icon" onClick={() => saveEditedTimer(timer.id)} title="Save">
                            <Check size={16} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => (timer.isPaused ? startTimer(timer.id) : pauseTimer(timer.id))}
                            disabled={timer.isFinished}
                            size="icon"
                            title={timer.isPaused ? "Start" : "Pause"}
                          >
                            {timer.isPaused ? <Play size={16} /> : <Pause size={16} />}
                          </Button>
                          <Button onClick={() => resetTimer(timer.id)} variant="outline" size="icon" title="Reset">
                            <RotateCcw size={16} />
                          </Button>
                          <Button onClick={() => toggleEdit(timer.id)} variant="outline" size="icon" title="Edit">
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            onClick={() => deleteTimer(timer.id)}
                            variant="destructive"
                            size="icon"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {presets.map((preset) => {
                const PresetIcon = preset.icon
                return (
                  <motion.div
                    key={preset.id}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer flex items-center gap-3",
                      preset.color ? `${preset.color} bg-opacity-10 border-opacity-20` : "bg-card",
                    )}
                    onClick={() => createPresetTimer(preset.id)}
                  >
                    <div className={cn("p-2 rounded-full", preset.color ? preset.color : "bg-primary")}>
                      <PresetIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{preset.name}</h3>
                      <p className="text-sm opacity-80">{formatTime(preset.duration)}</p>
                    </div>
                    {!DEFAULT_PRESETS.some((p) => p.id === preset.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePreset(preset.id)
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Preset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Preset</DialogTitle>
                  <DialogDescription>Add a new timer preset for quick access</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="preset-name">Preset Name</Label>
                    <Input
                      id="preset-name"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., Meditation"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="hours">Hours</Label>
                      <Input
                        id="hours"
                        type="number"
                        min="0"
                        max="99"
                        value={newPresetHours}
                        onChange={(e) => setNewPresetHours(Number(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="minutes">Minutes</Label>
                      <Input
                        id="minutes"
                        type="number"
                        min="0"
                        max="59"
                        value={newPresetMinutes}
                        onChange={(e) => setNewPresetMinutes(Number(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="seconds">Seconds</Label>
                      <Input
                        id="seconds"
                        type="number"
                        min="0"
                        max="59"
                        value={newPresetSeconds}
                        onChange={(e) => setNewPresetSeconds(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "bg-red-500",
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-purple-500",
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
                            newPresetColor === color ? "border-primary" : "border-transparent",
                          )}
                          onClick={() => setNewPresetColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={createNewPreset}>Create Preset</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
