import { createHash } from "crypto"

export interface TaskBlock {
  id: string
  userId: string
  action: "CREATE" | "COMPLETE" | "DELETE" | "UPDATE"
  taskData: {
    title: string
    description?: string
    completed: boolean
    dueDate?: string
    priority: "low" | "medium" | "high"
  }
  timestamp: number
  previousHash: string
  hash: string
  nonce: number
}

export interface TaskChain {
  userId: string
  blocks: TaskBlock[]
  lastHash: string
}

export class BlockchainSimulator {
  static generateHash(block: Omit<TaskBlock, "hash">): string {
    const data = JSON.stringify({
      id: block.id,
      userId: block.userId,
      action: block.action,
      taskData: block.taskData,
      timestamp: block.timestamp,
      previousHash: block.previousHash,
      nonce: block.nonce,
    })
    return createHash("sha256").update(data).digest("hex")
  }

  static mineBlock(block: Omit<TaskBlock, "hash" | "nonce">): TaskBlock {
    let nonce = 0
    let hash = ""

    // Simple proof of work - find hash starting with '0000'
    do {
      nonce++
      const blockWithNonce = { ...block, nonce }
      hash = this.generateHash(blockWithNonce)
    } while (!hash.startsWith("0000"))

    return { ...block, nonce, hash }
  }

  static createGenesisBlock(userId: string): TaskBlock {
    const genesisBlock = {
      id: "genesis",
      userId,
      action: "CREATE" as const,
      taskData: {
        title: "Genesis Block",
        completed: false,
        priority: "low" as const,
      },
      timestamp: Date.now(),
      previousHash: "0",
    }

    return this.mineBlock(genesisBlock)
  }

  static addBlock(chain: TaskChain, taskData: TaskBlock["taskData"], action: TaskBlock["action"]): TaskBlock {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      userId: chain.userId,
      action,
      taskData,
      timestamp: Date.now(),
      previousHash: chain.lastHash,
    }

    const minedBlock = this.mineBlock(newBlock)
    chain.blocks.push(minedBlock)
    chain.lastHash = minedBlock.hash

    return minedBlock
  }

  static validateChain(chain: TaskChain): boolean {
    for (let i = 1; i < chain.blocks.length; i++) {
      const currentBlock = chain.blocks[i]
      const previousBlock = chain.blocks[i - 1]

      // Validate current block hash
      const recalculatedHash = this.generateHash({
        id: currentBlock.id,
        userId: currentBlock.userId,
        action: currentBlock.action,
        taskData: currentBlock.taskData,
        timestamp: currentBlock.timestamp,
        previousHash: currentBlock.previousHash,
        nonce: currentBlock.nonce,
      })

      if (currentBlock.hash !== recalculatedHash) {
        return false
      }

      // Validate chain linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }

    return true
  }
}
