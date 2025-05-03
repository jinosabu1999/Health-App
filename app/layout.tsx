import { Suspense } from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Analytics } from "@vercel/analytics/react"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Multi-Tool App",
  description: "A comprehensive multi-tool application with various utilities",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            {children}
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
