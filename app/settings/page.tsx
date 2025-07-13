"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Palette, Monitor, Moon, Sun, Type, Layout, RotateCcw } from "lucide-react"

export default function SettingsPage() {
  const { theme, updateTheme, resetTheme } = useTheme()
  const { user, logout } = useAuth()

  const handleThemeChange = (key: string, value: any) => {
    updateTheme({ [key]: value })
    toast({
      title: "Theme Updated",
      description: "Your theme preferences have been saved.",
    })
  }

  const handleResetTheme = () => {
    resetTheme()
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to default settings.",
    })
  }

  const primaryColors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
  ]

  const backgroundColors = [
    { name: "White", value: "#ffffff" },
    { name: "Gray", value: "#f8fafc" },
    { name: "Blue", value: "#f0f9ff" },
    { name: "Green", value: "#f0fdf4" },
    { name: "Purple", value: "#faf5ff" },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your decentralized to-do experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Customization
              </CardTitle>
              <CardDescription>Personalize your app's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <div className="text-sm text-muted-foreground">Toggle between light and dark themes</div>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={theme.mode === "dark"}
                    onCheckedChange={(checked) => handleThemeChange("mode", checked ? "dark" : "light")}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  {primaryColors.map((color) => (
                    <button
                      key={color.value}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        theme.primaryColor === color.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleThemeChange("primaryColor", color.value)}
                    >
                      <div className="w-full h-6 rounded" style={{ backgroundColor: color.value }} />
                      <div className="text-xs mt-1">{color.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color.value}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        theme.backgroundColor === color.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleThemeChange("backgroundColor", color.value)}
                    >
                      <div className="w-full h-6 rounded border" style={{ backgroundColor: color.value }} />
                      <div className="text-xs mt-1">{color.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Family
                </Label>
                <Select value={theme.fontFamily} onValueChange={(value) => handleThemeChange("fontFamily", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Layout */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Layout Density
                </Label>
                <Select
                  value={theme.layout}
                  onValueChange={(value: "compact" | "comfortable" | "spacious") => handleThemeChange("layout", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={handleResetTheme} className="w-full bg-transparent">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>User Information</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {user?.avatar ? (
                      <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Blockchain Status</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chain Validation</span>
                    <span className="text-sm text-green-600 font-medium">Valid</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">User ID</span>
                    <code className="text-xs bg-background px-2 py-1 rounded">{user?.id}</code>
                  </div>
                </div>
              </div>

              <Button variant="destructive" onClick={logout} className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
