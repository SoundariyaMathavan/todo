import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import type { User } from "./models"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = "7d"

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const privateKey = randomBytes(32).toString("hex")
    const publicKey = randomBytes(32).toString("hex")
    return { publicKey, privateKey }
  }

  static generateToken(user: Pick<User, "id" | "email">): string {
    return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return null
    }
  }

  static generateUserId(): string {
    return randomBytes(16).toString("hex")
  }

  static generateTransactionId(): string {
    return randomBytes(12).toString("hex")
  }
}
