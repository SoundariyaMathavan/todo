import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const user = await DatabaseService.createUser(email, password, name)
    const token = await DatabaseService.createSession(user.id)

    // Remove sensitive data
    const { password: _, privateKey: __, ...safeUser } = user

    return NextResponse.json({
      user: safeUser,
      token,
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.message === "User already exists") {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
