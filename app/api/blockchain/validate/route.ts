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

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    const isValid = await DatabaseService.validateUserChain(user.id)

    return NextResponse.json({
      isValid,
      message: isValid ? "Blockchain is valid" : "Blockchain validation failed",
    })
  } catch (error: any) {
    console.error("Validate blockchain error:", error)

    if (error.message.includes("token")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
