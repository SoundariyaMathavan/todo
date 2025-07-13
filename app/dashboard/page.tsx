"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTasks } from "@/contexts/task-context"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { toast } from "@/hooks/use-toast"
import { Plus, Check, AlertCircle, Shield, Download, Loader2, Hash, Blocks, Sparkles, Zap } from "lucide-react"
import { format } from "date-fns"
import { AnimatedBackground } from "@/components/animated-background"
import { FloatingElements } from "@/components/floating-elements"
import { AnimatedCard } from "@/components/animated-card"
import { MiningAnimation } from "@/components/mining-animation"
import { TaskCardAnimated } from "@/components/task-card-animated"
import { StatsCardAnimated } from "@/components/stats-card-animated"

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, chain, isLoading, addTask, completeTask, deleteTask, validateChain, exportChain } = useTasks()
  const { theme } = useTheme()
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showMiningAnimation, setShowMiningAnimation] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
  })

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required.",
        variant: "destructive",
      })
      return
    }

    setShowMiningAnimation(true)

    // Simulate mining delay for better UX
    setTimeout(async () => {
      await addTask(newTask.title, newTask.description, newTask.dueDate, newTask.priority)
      setNewTask({ title: "", description: "", dueDate: "", priority: "medium" })
      setIsAddingTask(false)
    }, 1000)
  }

  const handleValidateChain = async () => {
    setIsValidating(true)
    const isValid = await validateChain()
    setIsValidating(false)

    toast({
      title: isValid ? "Chain Valid ✨" : "Chain Invalid ❌",
      description: isValid ? "Your blockchain is secure and valid!" : "Blockchain validation failed!",
      variant: isValid ? "default" : "destructive",
    })
  }

  const handleExportChain = () => {
    const chainData = exportChain()
    const blob = new Blob([chainData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `task-blockchain-${user?.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Blockchain Exported 🚀",
      description: "Your task blockchain has been downloaded.",
    })
  }

  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <FloatingElements />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Blocks className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="text-lg font-medium"
          >
            Loading blockchain...
          </motion.span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      <FloatingElements />

      <div
        className={`relative z-10 p-6 ${theme.layout === "compact" ? "space-y-4" : theme.layout === "spacious" ? "space-y-8" : "space-y-6"}`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Animated Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Welcome back, {user?.name}! ✨
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-muted-foreground mt-2"
              >
                Manage your decentralized to-do blockchain
              </motion.p>

              {chain && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex items-center gap-4 mt-3 text-sm text-muted-foreground"
                >
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">Chain: {chain.lastBlockHash.substring(0, 12)}...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Blocks className="h-3 w-3" />
                    <span>Blocks: {chain.totalBlocks}</span>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex gap-3"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handleValidateChain}
                  disabled={isValidating}
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20"
                >
                  {isValidating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Loader2 className="mr-2 h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  Validate Chain
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handleExportChain}
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Blockchain
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCardAnimated
              title="Active Tasks"
              value={activeTasks.length}
              icon={AlertCircle}
              color="text-blue-500"
              gradient="from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatsCardAnimated
              title="Completed"
              value={completedTasks.length}
              icon={Check}
              color="text-green-500"
              gradient="from-green-500 to-emerald-500"
              delay={0.2}
            />
            <StatsCardAnimated
              title="Total Blocks"
              value={chain?.totalBlocks || 0}
              icon={Shield}
              color="text-purple-500"
              gradient="from-purple-500 to-pink-500"
              delay={0.3}
            />
            <StatsCardAnimated
              title="High Priority"
              value={activeTasks.filter((t) => t.priority === "high").length}
              icon={Zap}
              color="text-red-500"
              gradient="from-red-500 to-orange-500"
              delay={0.4}
            />
          </div>

          {/* Add Task Card */}
          <AnimatedCard delay={0.5} className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Add New Task
              </CardTitle>
              <CardDescription>Create a new task block in your blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {!isAddingTask ? (
                  <motion.div key="add-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setIsAddingTask(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="add-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter task title"
                          value={newTask.title}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                          className="border-2 focus:border-primary/50 transition-colors"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setNewTask((prev) => ({ ...prev, priority: value }))
                          }
                        >
                          <SelectTrigger className="border-2 focus:border-primary/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Low</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="high">🔴 High</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter task description (optional)"
                        value={newTask.description}
                        onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                        className="border-2 focus:border-primary/50 transition-colors"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="datetime-local"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                        className="border-2 focus:border-primary/50 transition-colors"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex gap-3"
                    >
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={handleAddTask}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Add Task
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                          Cancel
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </AnimatedCard>

          {/* Active Tasks */}
          <AnimatedCard delay={0.6} className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Active Tasks
              </CardTitle>
              <CardDescription>Your current blockchain tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {activeTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="mb-4"
                    >
                      <Sparkles className="h-16 w-16 text-muted-foreground mx-auto" />
                    </motion.div>
                    <p className="text-muted-foreground text-lg">No active tasks. Add one to get started! ✨</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {activeTasks.map((task, index) => (
                      <TaskCardAnimated
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                        onDelete={deleteTask}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </AnimatedCard>

          {/* Completed Tasks */}
          <AnimatePresence>
            {completedTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.7 }}
              >
                <AnimatedCard delay={0.7}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      Completed Tasks
                    </CardTitle>
                    <CardDescription>Your blockchain history of completed tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {completedTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border rounded-lg opacity-75 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold line-through text-muted-foreground">{task.title}</h3>
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                ✅ Completed
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground font-mono">
                              Block: {task.blockHash.substring(0, 16)}... | {format(new Date(task.updatedAt), "PPp")}
                            </p>
                          </div>
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          >
                            <Check className="h-6 w-6 text-green-500" />
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mining Animation */}
      <MiningAnimation isVisible={showMiningAnimation} onComplete={() => setShowMiningAnimation(false)} />
    </div>
  )
}
