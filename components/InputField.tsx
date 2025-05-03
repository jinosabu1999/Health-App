"use client"

import type { ChangeEvent } from "react"
import { cn } from "@/lib/utils"

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function InputField({ label, value, onChange, placeholder, className }: InputFieldProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className={cn(
          "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        placeholder={placeholder}
        min="0"
        step="any"
      />
    </div>
  )
}
