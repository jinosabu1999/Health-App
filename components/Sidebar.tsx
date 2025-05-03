"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Activity, ChevronLeft, ChevronRight, MessageSquare, Timer, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "./ThemeSwitcher"

interface SidebarProps {
  selectedTool: string
  onSelectTool: (toolId: string) => void
}

export function Sidebar({ selectedTool, onSelectTool }: SidebarProps) {
  const [expanded, setExpanded] = useState(true)

  const tools = [
    { id: "bmi", name: "Health", icon: Activity },
    { id: "tts", name: "Speech", icon: MessageSquare },
    { id: "timer", name: "Timer", icon: Timer },
    { id: "focus", name: "Focus", icon: Target },
  ]

  return (
    <motion.div
      className={cn(
        "fixed left-0 top-0 z-30 flex h-full flex-col border-r border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300",
        expanded ? "w-64" : "w-20",
      )}
      initial={false}
      animate={{ width: expanded ? 256 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {expanded && <h1 className="text-xl font-bold">Multi-Tool</h1>}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isSelected = selectedTool === tool.id
          return (
            <Button
              key={tool.id}
              variant={isSelected ? "default" : "ghost"}
              className={cn(
                "flex h-12 justify-start gap-3 transition-all",
                isSelected && "bg-primary text-primary-foreground",
              )}
              onClick={() => onSelectTool(tool.id)}
            >
              <Icon className={cn("h-5 w-5", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
              {expanded && <span>{tool.name}</span>}
            </Button>
          )
        })}
      </div>

      <div className="p-4">
        <ThemeSwitcher expanded={expanded} />
      </div>
    </motion.div>
  )
}
