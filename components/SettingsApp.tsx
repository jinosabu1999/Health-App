"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function SettingsApp() {
  return (
    <div className="container mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6 mt-4 md:mt-0">Settings</h1>
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-2">Appearance</h2>
            <p className="text-muted-foreground">Customize the look and feel of the application</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-2">Notifications</h2>
            <p className="text-muted-foreground">Configure sound and vibration alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-2">Timer Presets</h2>
            <p className="text-muted-foreground">Manage your saved timer configurations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-2">About</h2>
            <p className="text-muted-foreground">Version 1.0.0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
