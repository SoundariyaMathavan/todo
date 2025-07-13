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

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    const tasks = await DatabaseService.getUserTasks(user.id)

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("Get tasks error:", error)

    if (error.message.includes("token")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    const { title, description, dueDate, priority } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const task = await DatabaseService.createTask(
      user.id,
      title,
      description,
      dueDate ? new Date(dueDate) : undefined,
      priority,
    )

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error("Create task error:", error)

    if (error.message.includes("token")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
