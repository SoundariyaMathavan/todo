import type { ObjectId } from "mongodb"
import type { Block, Transaction } from "./advanced-blockchain"

export interface User {
  _id?: ObjectId
  id: string
  email: string
  name: string
  password: string
  avatar?: string
  publicKey: string
  privateKey: string
  createdAt: Date
  updatedAt: Date
  theme?: {
    mode: "light" | "dark"
    primaryColor: string
    backgroundColor: string
    fontFamily: string
    layout: "compact" | "comfortable" | "spacious"
  }
}

export interface UserChain {
  _id?: ObjectId
  userId: string
  blocks: Block[]
  pendingTransactions: Transaction[]
  lastBlockHash: string
  totalBlocks: number
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  _id?: ObjectId
  id: string
  userId: string
  title: string
  description?: string
  completed: boolean
  dueDate?: Date
  priority: "low" | "medium" | "high"
  blockHash: string
  transactionId: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface Session {
  _id?: ObjectId
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}
