"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"
import type { Block, TaskTransaction } from "@/lib/advanced-blockchain"

interface Task {
  id: string
  userId: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  priority: "low" | "medium" | "high"
  blockHash: string
  transactionId: string
  createdAt: string
  updatedAt: string
}

interface UserChain {
  userId: string
  blocks: Block[]
  pendingTransactions: TaskTransaction[]
  lastBlockHash: string
  totalBlocks: number
}

interface TaskContextType {
  chain: UserChain | null
  tasks: Task[]
  isLoading: boolean
  addTask: (
    title: string,
    description?: string,
    dueDate?: string,
    priority?: "low" | "medium" | "high",
  ) => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  validateChain: () => Promise<boolean>
  exportChain: () => string
  refreshData: () => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth()
  const [chain, setChain] = useState<UserChain | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && token) {
      refreshData()
    }
  }, [user, token])

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("No authentication token")
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  }

  const refreshData = async () => {
    if (!user || !token) return

    setIsLoading(true)
    try {
      // Fetch tasks
      const tasksResponse = await makeAuthenticatedRequest("/api/tasks")
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.tasks)
      }

      // Fetch blockchain
      const chainResponse = await makeAuthenticatedRequest("/api/blockchain")
      if (chainResponse.ok) {
        const chainData = await chainResponse.json()
        setChain(chainData.chain)
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTask = async (
    title: string,
    description?: string,
    dueDate?: string,
    priority: "low" | "medium" | "high" = "medium",
  ) => {
    try {
      const response = await makeAuthenticatedRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          dueDate,
          priority,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks((prev) => [...prev, data.task])
        await refreshData() // Refresh to get updated blockchain

        toast({
          title: "Task Added",
          description: `"${title}" has been added to your blockchain.`,
        })

        // Check for due date notifications
        if (dueDate) {
          const dueTime = new Date(dueDate).getTime()
          const now = Date.now()
          const timeUntilDue = dueTime - now

          if (timeUntilDue > 0 && timeUntilDue <= 24 * 60 * 60 * 1000) {
            setTimeout(
              () => {
                toast({
                  title: "Task Due Soon",
                  description: `"${title}" is due soon!`,
                  variant: "destructive",
                })
              },
              Math.max(0, timeUntilDue - 60 * 60 * 1000),
            )
          }
        }
      } else {
        throw new Error("Failed to add task")
      }
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      })
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ completed: true }),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks((prev) => prev.map((task) => (task.id === taskId ? data.task : task)))
        await refreshData()

        const task = tasks.find((t) => t.id === taskId)
        toast({
          title: "Task Completed",
          description: `"${task?.title}" has been marked as complete.`,
        })
      } else {
        throw new Error("Failed to complete task")
      }
    } catch (error) {
      console.error("Error completing task:", error)
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      const response = await makeAuthenticatedRequest(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId))
        await refreshData()

        toast({
          title: "Task Deleted",
          description: `"${task?.title}" has been deleted (recorded in blockchain).`,
        })
      } else {
        throw new Error("Failed to delete task")
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks((prev) => prev.map((task) => (task.id === taskId ? data.task : task)))
        await refreshData()

        toast({
          title: "Task Updated",
          description: `Task has been updated.`,
        })
      } else {
        throw new Error("Failed to update task")
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const validateChain = async (): Promise<boolean> => {
    try {
      const response = await makeAuthenticatedRequest("/api/blockchain/validate", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        return data.isValid
      }
      return false
    } catch (error) {
      console.error("Error validating chain:", error)
      return false
    }
  }

  const exportChain = (): string => {
    if (!chain) return ""
    return JSON.stringify(chain, null, 2)
  }

  return (
    <TaskContext.Provider
      value={{
        chain,
        tasks,
        isLoading,
        addTask,
        completeTask,
        deleteTask,
        updateTask,
        validateChain,
        exportChain,
        refreshData,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
