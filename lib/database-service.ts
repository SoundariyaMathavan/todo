import { getDatabase } from "./mongodb"
import { AuthService } from "./auth"
import { AdvancedBlockchain } from "./advanced-blockchain"
import type { User, UserChain, Task, Session } from "./models"
import type { Block, TaskTransaction } from "./advanced-blockchain"

export class DatabaseService {
  private static async getCollection(name: string) {
    const db = await getDatabase()
    return db.collection(name)
  }

  // User operations
  static async createUser(email: string, password: string, name: string): Promise<User> {
    const users = await this.getCollection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    const hashedPassword = await AuthService.hashPassword(password)
    const { publicKey, privateKey } = AuthService.generateKeyPair()

    const user: User = {
      id: AuthService.generateUserId(),
      email,
      name,
      password: hashedPassword,
      publicKey,
      privateKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await users.insertOne(user)

    // Create genesis block for user
    await this.initializeUserChain(user.id)

    return user
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const users = await this.getCollection("users")
    const user = (await users.findOne({ email })) as User | null

    if (!user) return null

    const isValidPassword = await AuthService.verifyPassword(password, user.password)
    if (!isValidPassword) return null

    return user
  }

  static async getUserById(userId: string): Promise<User | null> {
    const users = await this.getCollection("users")
    return (await users.findOne({ id: userId })) as User | null
  }

  static async updateUserTheme(userId: string, theme: User["theme"]): Promise<void> {
    const users = await this.getCollection("users")
    await users.updateOne(
      { id: userId },
      {
        $set: {
          theme,
          updatedAt: new Date(),
        },
      },
    )
  }

  // Session operations
  static async createSession(userId: string): Promise<string> {
    const sessions = await this.getCollection("sessions")
    const token = AuthService.generateToken({ id: userId, email: "" })

    const session: Session = {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    }

    await sessions.insertOne(session)
    return token
  }

  static async validateSession(token: string): Promise<User | null> {
    const payload = AuthService.verifyToken(token)
    if (!payload) return null

    const sessions = await this.getCollection("sessions")
    const session = await sessions.findOne({
      token,
      expiresAt: { $gt: new Date() },
    })

    if (!session) return null

    return await this.getUserById(payload.userId)
  }

  static async deleteSession(token: string): Promise<void> {
    const sessions = await this.getCollection("sessions")
    await sessions.deleteOne({ token })
  }

  // Blockchain operations
  static async initializeUserChain(userId: string): Promise<void> {
    const chains = await this.getCollection("chains")

    const genesisBlock = AdvancedBlockchain.createGenesisBlock(userId)

    const userChain: UserChain = {
      userId,
      blocks: [genesisBlock],
      pendingTransactions: [],
      lastBlockHash: genesisBlock.hash,
      totalBlocks: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await chains.insertOne(userChain)
  }

  static async getUserChain(userId: string): Promise<UserChain | null> {
    const chains = await this.getCollection("chains")
    return (await chains.findOne({ userId })) as UserChain | null
  }

  static async addTransactionToChain(userId: string, transaction: TaskTransaction): Promise<Block> {
    const chains = await this.getCollection("chains")
    const userChain = await this.getUserChain(userId)

    if (!userChain) {
      throw new Error("User chain not found")
    }

    // Add transaction to pending transactions
    userChain.pendingTransactions.push(transaction)

    // Mine new block if we have enough transactions or it's been a while
    if (userChain.pendingTransactions.length >= 1) {
      // Mine immediately for demo
      const newBlock = AdvancedBlockchain.mineBlock(
        userChain.totalBlocks,
        userChain.pendingTransactions,
        userChain.lastBlockHash,
        userId,
      )

      userChain.blocks.push(newBlock)
      userChain.pendingTransactions = []
      userChain.lastBlockHash = newBlock.hash
      userChain.totalBlocks++
      userChain.updatedAt = new Date()

      await chains.updateOne({ userId }, { $set: userChain })

      return newBlock
    }

    await chains.updateOne({ userId }, { $set: userChain })

    throw new Error("Transaction added to pending, block not yet mined")
  }

  static async validateUserChain(userId: string): Promise<boolean> {
    const userChain = await this.getUserChain(userId)
    if (!userChain) return false

    return AdvancedBlockchain.validateChain(userChain.blocks)
  }

  // Task operations
  static async createTask(
    userId: string,
    title: string,
    description?: string,
    dueDate?: Date,
    priority: "low" | "medium" | "high" = "medium",
  ): Promise<Task> {
    const taskId = AuthService.generateTransactionId()
    const transactionId = AuthService.generateTransactionId()

    const transaction: TaskTransaction = {
      id: transactionId,
      from: userId,
      to: userId,
      data: {
        action: "CREATE",
        taskId,
        taskData: {
          title,
          description,
          completed: false,
          dueDate: dueDate?.toISOString(),
          priority,
        },
      },
      timestamp: Date.now(),
    }

    const block = await this.addTransactionToChain(userId, transaction)

    const task: Task = {
      id: taskId,
      userId,
      title,
      description,
      completed: false,
      dueDate,
      priority,
      blockHash: block.hash,
      transactionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const tasks = await this.getCollection("tasks")
    await tasks.insertOne(task)

    return task
  }

  static async getUserTasks(userId: string): Promise<Task[]> {
    const tasks = await this.getCollection("tasks")
    return (await tasks
      .find({
        userId,
        deletedAt: { $exists: false },
      })
      .toArray()) as Task[]
  }

  static async updateTask(
    userId: string,
    taskId: string,
    updates: Partial<Pick<Task, "title" | "description" | "completed" | "dueDate" | "priority">>,
  ): Promise<Task> {
    const tasks = await this.getCollection("tasks")
    const existingTask = (await tasks.findOne({ id: taskId, userId })) as Task | null

    if (!existingTask) {
      throw new Error("Task not found")
    }

    const transactionId = AuthService.generateTransactionId()

    const transaction: TaskTransaction = {
      id: transactionId,
      from: userId,
      to: userId,
      data: {
        action: "UPDATE",
        taskId,
        taskData: {
          ...existingTask,
          ...updates,
          dueDate: updates.dueDate?.toISOString() || existingTask.dueDate?.toISOString(),
        },
        previousState: existingTask,
      },
      timestamp: Date.now(),
    }

    const block = await this.addTransactionToChain(userId, transaction)

    const updatedTask = {
      ...existingTask,
      ...updates,
      blockHash: block.hash,
      transactionId,
      updatedAt: new Date(),
    }

    await tasks.updateOne({ id: taskId, userId }, { $set: updatedTask })

    return updatedTask as Task
  }

  static async deleteTask(userId: string, taskId: string): Promise<void> {
    const tasks = await this.getCollection("tasks")
    const existingTask = (await tasks.findOne({ id: taskId, userId })) as Task | null

    if (!existingTask) {
      throw new Error("Task not found")
    }

    const transactionId = AuthService.generateTransactionId()

    const transaction: TaskTransaction = {
      id: transactionId,
      from: userId,
      to: userId,
      data: {
        action: "DELETE",
        taskId,
        taskData: existingTask,
        previousState: existingTask,
      },
      timestamp: Date.now(),
    }

    const block = await this.addTransactionToChain(userId, transaction)

    await tasks.updateOne(
      { id: taskId, userId },
      {
        $set: {
          deletedAt: new Date(),
          blockHash: block.hash,
          transactionId,
          updatedAt: new Date(),
        },
      },
    )
  }
}
