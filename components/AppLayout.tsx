"use client"

import { useState, useEffect } from "react"
import { Menu, Activity, FileText, Timer, Target, Moon, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import BMICalculator from "./BMICalculator"
import NoteTaking from "./NoteTaking"
import CountdownTimer from "./CountdownTimer"
import FocusTracker from "./FocusTracker"
import { Toaster } from "@/components/ui/toast"
import { useToast, initializeToast } from "@/hooks/use-toast"

export default function AppLayout() {
  const [isMounted, setIsMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeApp, setActiveApp] = useState("bmi") // Set BMI calculator as default

  // Initialize toast handler
  const toastHandler = useToast()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    // Initialize toast handler
    initializeToast(toastHandler)
  }, [toastHandler])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const menuItems = [
    { id: "bmi", icon: Activity, label: "Health" },
    { id: "notes", icon: FileText, label: "Notes" },
    { id: "timer", icon: Timer, label: "Timer" },
    { id: "focus", icon: Target, label: "Focus" },
  ]

  const handleNavigation = (appId: string) => {
    setActiveApp(appId)
    // Only close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      {/* Mobile menu button - moved inside a header container */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b z-40 flex items-center md:hidden">
        <Button variant="ghost" size="icon" className="ml-4" onClick={toggleSidebar} aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Multi-Tool App</h1>
      </header>

      {/* Sidebar - both mobile and desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-background border-r",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:z-30", // Lower z-index on desktop, higher on mobile
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b">
            <h1 className="text-xl font-bold">Multi-Tool App</h1>
            {/* Close button - only visible on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-4 space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeApp === item.id ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", activeApp === item.id && "bg-secondary font-medium")}
                  onClick={() => handleNavigation(item.id)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            {/* Theme switcher - simplified and fixed */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="ml-auto rounded-full"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isMounted &&
                (theme === "dark" ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                ))}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div
        className={cn(
          "flex flex-col flex-1 w-full",
          "md:pl-64",
          "pt-16 md:pt-0", // Add top padding for mobile header
        )}
      >
        <main className="flex-1">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {menuItems.find((item) => item.id === activeApp)?.label}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Use the {menuItems.find((item) => item.id === activeApp)?.label.toLowerCase()} tool to help with your
                  tasks
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
                {activeApp === "bmi" && <BMICalculator />}
                {activeApp === "notes" && <NoteTaking />}
                {activeApp === "timer" && <CountdownTimer />}
                {activeApp === "focus" && <FocusTracker />}
              </div>
            </div>
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </div>
  )
}
