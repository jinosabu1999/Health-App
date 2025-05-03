"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, MessageSquare, Timer, TargetIcon } from "lucide-react"
import BMICalculator from "./BMICalculator"
import TextToSpeech from "./TextToSpeech"
import CountdownTimer from "./CountdownTimer"
import FocusTracker from "./FocusTracker"
import { Sidebar } from "./Sidebar"

const tools = [
  { id: "bmi", name: "Health", icon: Activity, component: BMICalculator },
  { id: "tts", name: "Speech", icon: MessageSquare, component: TextToSpeech },
  { id: "timer", name: "Timer", icon: Timer, component: CountdownTimer },
  { id: "focus", name: "Focus", icon: TargetIcon, component: FocusTracker },
]

export default function ToolSelector() {
  const [selectedTool, setSelectedTool] = useState(tools[0])

  const handleSelectTool = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId)
    if (tool) {
      setSelectedTool(tool)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar selectedTool={selectedTool.id} onSelectTool={handleSelectTool} />

      <main className="flex-1 pl-20 lg:pl-64">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{selectedTool.name}</h1>
            <p className="text-muted-foreground">
              Use the {selectedTool.name.toLowerCase()} tool to help with your tasks
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <selectedTool.component />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
