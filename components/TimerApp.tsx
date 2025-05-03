"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function TimerApp() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("timer")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true)
      const startTime = Date.now() - time
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTime)
      }, 10)
    }
  }

  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
      setIsRunning(false)
    }
  }

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsRunning(false)
    setTime(0)
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)

    return {
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      milliseconds: milliseconds.toString().padStart(2, "0"),
    }
  }

  const { minutes, seconds, milliseconds } = formatTime(time)

  return (
    <div className="container mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6 mt-4 md:mt-0">Timer</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative w-64 h-64 mb-8">
                  {/* Timer circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (((time / (60 * 1000)) * 283) % 283)}
                      className="text-primary transition-all duration-300"
                    />
                  </svg>

                  {/* Timer display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold tabular-nums tracking-tight">
                      {minutes}:{seconds}
                    </div>
                    <div className="text-xl tabular-nums text-muted-foreground">{milliseconds}</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex space-x-4">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={resetTimer}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="default"
                    size="icon"
                    className="h-16 w-16 rounded-full"
                    onClick={isRunning ? pauseTimer : startTimer}
                  >
                    {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stopwatch" className="mt-4">
          <Card>
            <CardContent className="pt-6 pb-8">
              <div className="flex flex-col items-center">
                <div className="text-center mb-8">
                  <p className="text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent timers section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Recent Timers</h2>
        <div className="space-y-3">
          {[
            { label: "Morning Workout", time: "25:00" },
            { label: "Meditation", time: "10:00" },
            { label: "Study Session", time: "45:00" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <span>{item.label}</span>
              <span className="font-mono">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
