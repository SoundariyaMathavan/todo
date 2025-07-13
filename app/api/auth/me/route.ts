import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await DatabaseService.validateSession(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Remove sensitive data
    const { password: _, privateKey: __, ...safeUser } = user

    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error("Auth validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
