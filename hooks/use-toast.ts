"use client"

import { useState, useCallback } from "react"

export type ToastVariant = "default" | "destructive"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

const TOAST_TIMEOUT = 5000

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, variant }

    setToasts((prevToasts) => [...prevToasts, newToast])

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, TOAST_TIMEOUT)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return { toast, dismiss, toasts }
}

// Singleton pattern for global toast access
let toastHandler: ReturnType<typeof useToast> | null = null

// This is used in client components
export function toast(props: Omit<Toast, "id">) {
  if (typeof window === "undefined") return ""

  if (!toastHandler) {
    console.error("Toast handler not initialized")
    return ""
  }

  return toastHandler.toast(props)
}

// Initialize the toast handler
export function initializeToast(handler: ReturnType<typeof useToast>) {
  toastHandler = handler
}
