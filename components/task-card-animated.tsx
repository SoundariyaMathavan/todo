"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Trash2, Calendar, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  priority: "low" | "medium" | "high"
  blockHash: string
  createdAt: string
}

interface TaskCardAnimatedProps {
  task: Task
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  index: number
}

export function TaskCardAnimated({ task, onComplete, onDelete, index }: TaskCardAnimatedProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white"
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "low":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    await new Promise((resolve) => setTimeout(resolve, 800)) // Animation delay
    onComplete(task.id)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Animation delay
    onDelete(task.id)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        initial={{ opacity: 0, x: -50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{
          opacity: 0,
          x: isDeleting ? 100 : -100,
          scale: 0.8,
          transition: { duration: 0.3 },
        }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          ease: "easeOut",
        }}
        whileHover={{
          scale: 1.02,
          y: -5,
          transition: { duration: 0.2 },
        }}
        className="relative"
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 hover:shadow-xl transition-all duration-300">
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 hover:opacity-20 transition-opacity duration-300"
            style={{ padding: "1px" }}
          />

          <CardContent className="p-6 relative">
            {/* Priority indicator */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            >
              <div className={`h-full ${getPriorityColor(task.priority).replace("text-white", "")}`} />
            </motion.div>

            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <motion.h3
                    className="font-semibold text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {task.title}
                  </motion.h3>

                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: index * 0.1 + 0.4,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    <Badge className={`${getPriorityColor(task.priority)} shadow-lg`}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      {task.priority}
                    </Badge>
                  </motion.div>
                </div>

                {task.description && (
                  <motion.p
                    className="text-muted-foreground text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    {task.description}
                  </motion.p>
                )}

                {task.dueDate && (
                  <motion.div
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.6 }}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>Due: {format(new Date(task.dueDate), "PPp")}</span>
                  </motion.div>
                )}

                <motion.p
                  className="text-xs text-muted-foreground font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                >
                  Block: {task.blockHash.substring(0, 16)}...
                </motion.p>
              </div>

              <div className="flex gap-2 ml-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                  >
                    {isCompleting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg"
                  >
                    {isDeleting ? (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion animation overlay */}
        <AnimatePresence>
          {isCompleting && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="bg-green-500 rounded-full p-4"
              >
                <Check className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
