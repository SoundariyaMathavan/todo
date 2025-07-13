import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

async function authenticateRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    throw new Error("No token provided")
  }

  const user = await DatabaseService.validateSession(token)

  if (!user) {
    throw new Error("Invalid or expired token")
  }

  return user
}

export async function PUT(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const user = await authenticateRequest(request)
    const { taskId } = params
    const updates = await request.json()

    const task = await DatabaseService.updateTask(user.id, taskId, updates)

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error("Update task error:", error)

    if (error.message.includes("token")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (error.message === "Task not found") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const user = await authenticateRequest(request)
    const { taskId } = params

    await DatabaseService.deleteTask(user.id, taskId)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error: any) {
    console.error("Delete task error:", error)

    if (error.message.includes("token")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (error.message === "Task not found") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
