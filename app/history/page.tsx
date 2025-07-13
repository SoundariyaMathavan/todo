"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useTasks } from "@/contexts/task-context"
import { format } from "date-fns"
import {
  Search,
  GitBranch,
  Hash,
  Clock,
  User,
  Activity,
} from "lucide-react"

export default function HistoryPage() {
  const { chain } = useTasks()
  const [searchTerm, setSearchTerm] = useState("")

  if (!chain) {
    return <div>Loading blockchain...</div>
  }

  const filteredBlocks = chain.blocks.filter((block) => {
    const title = block.taskData?.title || ""
    const action = block.action || ""
    const hash = block.hash || ""

    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hash.includes(searchTerm)
    )
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "COMPLETE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <GitBranch className="h-4 w-4" />
      case "COMPLETE":
        return <Activity className="h-4 w-4" />
      case "DELETE":
        return <Hash className="h-4 w-4" />
      case "UPDATE":
        return <Clock className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blockchain History</h1>
          <p className="text-muted-foreground">
            Complete timeline of your task blockchain
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search blocks by title, action, or hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Blocks</p>
                  <p className="text-2xl font-bold">{chain.blocks.length}</p>
                </div>
                <Hash className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chain Length</p>
                  <p className="text-2xl font-bold">{chain.blocks.length - 1}</p>
                </div>
                <GitBranch className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Hash</p>
                  <p className="text-sm font-mono">
                    {chain.lastHash?.substring(0, 12)}...
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Timeline</CardTitle>
            <CardDescription>
              Chronological view of all blockchain transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBlocks.reverse().map((block, index) => (
                <div key={block.hash} className="relative">
                  {index < filteredBlocks.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                  )}

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {getActionIcon(block.action)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionColor(block.action)}>
                          {block.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(block.timestamp), "PPp")}
                        </span>
                      </div>

                      {block.taskData?.title && (
                        <h3 className="font-semibold mb-1">{block.taskData.title}</h3>
                      )}

                      {block.taskData?.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {block.taskData.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Block Hash:</span>
                          <code className="ml-1 bg-muted px-1 rounded">
                            {block.hash.substring(0, 16)}...
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Previous Hash:</span>
                          <code className="ml-1 bg-muted px-1 rounded">
                            {block.previousHash.substring(0, 16)}...
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Nonce:</span>
                          <code className="ml-1 bg-muted px-1 rounded">
                            {block.nonce}
                          </code>
                        </div>
                        {block.taskData?.priority && (
                          <div>
                            <span className="font-medium">Priority:</span>
                            <span className="ml-1 capitalize">
                              {block.taskData.priority}
                            </span>
                          </div>
                        )}
                      </div>

                      {block.taskData?.dueDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Due Date:</span>
                          <span className="ml-1">
                            {format(new Date(block.taskData.dueDate), "PPp")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
