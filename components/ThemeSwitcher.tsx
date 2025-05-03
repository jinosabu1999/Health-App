"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ThemeSwitcherProps {
  expanded?: boolean
}

export function ThemeSwitcher({ expanded = true }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size={expanded ? "default" : "icon"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : 180,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="mr-2"
      >
        {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
      </motion.div>
      {expanded && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
    </Button>
  )
}
