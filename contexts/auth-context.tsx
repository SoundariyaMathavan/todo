"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  publicKey: string
  theme?: {
    mode: "light" | "dark"
    primaryColor: string
    backgroundColor: string
    fontFamily: string
    layout: "compact" | "comfortable" | "spacious"
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token and validate it
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      validateToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(tokenToValidate)
      } else {
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error("Token validation error:", error)
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("token", data.token)
        setIsLoading(false)
        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true)

    // Simulate OAuth flow - in real implementation, use Google OAuth
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demo purposes, create a mock Google user
    const mockGoogleUser = {
      email: "user@gmail.com",
      password: "google-oauth-temp",
      name: "Google User",
    }

    const success = await register(mockGoogleUser.email, mockGoogleUser.password, mockGoogleUser.name)
    setIsLoading(false)
    return success
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("token", data.token)
        setIsLoading(false)
        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error("Logout error:", error)
      }
    }

    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithGoogle,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
