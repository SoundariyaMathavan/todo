"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Theme {
  mode: "light" | "dark"
  primaryColor: string
  backgroundColor: string
  fontFamily: string
  layout: "compact" | "comfortable" | "spacious"
}

interface ThemeContextType {
  theme: Theme
  updateTheme: (updates: Partial<Theme>) => void
  resetTheme: () => void
}

const defaultTheme: Theme = {
  mode: "light",
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  fontFamily: "Inter",
  layout: "comfortable",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme) {
      setTheme(JSON.parse(storedTheme))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme))

    // Apply theme to document
    document.documentElement.classList.toggle("dark", theme.mode === "dark")
    document.documentElement.style.setProperty("--primary-color", theme.primaryColor)
    document.documentElement.style.setProperty("--background-color", theme.backgroundColor)
    document.documentElement.style.setProperty("--font-family", theme.fontFamily)
  }, [theme])

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme((prev) => ({ ...prev, ...updates }))
  }

  const resetTheme = () => {
    setTheme(defaultTheme)
  }

  return <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
