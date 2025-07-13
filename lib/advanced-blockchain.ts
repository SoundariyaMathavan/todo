import { createHash } from "crypto"

export interface Transaction {
  id: string
  from: string
  to: string
  data: any
  timestamp: number
  signature?: string
}

export interface Block {
  index: number
  timestamp: number
  transactions: Transaction[]
  previousHash: string
  hash: string
  nonce: number
  merkleRoot: string
  difficulty: number
  miner: string
}

export interface TaskTransaction extends Transaction {
  data: {
    action: "CREATE" | "COMPLETE" | "DELETE" | "UPDATE"
    taskId: string
    taskData: {
      title: string
      description?: string
      completed: boolean
      dueDate?: string
      priority: "low" | "medium" | "high"
    }
    previousState?: any
  }
}

export class AdvancedBlockchain {
  private static readonly DIFFICULTY = 4
  private static readonly MINING_REWARD = 10
  private static readonly MAX_TRANSACTIONS_PER_BLOCK = 10

  static calculateHash(
    index: number,
    timestamp: number,
    transactions: Transaction[],
    previousHash: string,
    nonce: number,
    merkleRoot: string,
  ): string {
    const data = `${index}${timestamp}${JSON.stringify(transactions)}${previousHash}${nonce}${merkleRoot}`
    return createHash("sha256").update(data).digest("hex")
  }

  static calculateMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) return createHash("sha256").update("").digest("hex")

    let hashes = transactions.map((tx) => createHash("sha256").update(JSON.stringify(tx)).digest("hex"))

    while (hashes.length > 1) {
      const newHashes: string[] = []

      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i]
        const right = i + 1 < hashes.length ? hashes[i + 1] : left
        const combined = createHash("sha256")
          .update(left + right)
          .digest("hex")
        newHashes.push(combined)
      }

      hashes = newHashes
    }

    return hashes[0]
  }

  static mineBlock(
    index: number,
    transactions: Transaction[],
    previousHash: string,
    miner: string,
    difficulty: number = this.DIFFICULTY,
  ): Block {
    const timestamp = Date.now()
    const merkleRoot = this.calculateMerkleRoot(transactions)
    let nonce = 0
    let hash = ""

    const target = "0".repeat(difficulty)

    console.log(`Mining block ${index} with difficulty ${difficulty}...`)
    const startTime = Date.now()

    do {
      nonce++
      hash = this.calculateHash(index, timestamp, transactions, previousHash, nonce, merkleRoot)
    } while (!hash.startsWith(target))

    const endTime = Date.now()
    console.log(`Block mined in ${endTime - startTime}ms with nonce: ${nonce}`)

    return {
      index,
      timestamp,
      transactions,
      previousHash,
      hash,
      nonce,
      merkleRoot,
      difficulty,
      miner,
    }
  }

  static createGenesisBlock(userId: string): Block {
    const genesisTransaction: Transaction = {
      id: "genesis",
      from: "system",
      to: userId,
      data: {
        action: "GENESIS",
        message: "Genesis block created",
      },
      timestamp: Date.now(),
    }

    return this.mineBlock(0, [genesisTransaction], "0", "system")
  }

  static validateBlock(block: Block, previousBlock?: Block): boolean {
    // Validate block structure
    if (!block.hash || !block.previousHash || !block.merkleRoot) {
      return false
    }

    // Validate hash
    const recalculatedHash = this.calculateHash(
      block.index,
      block.timestamp,
      block.transactions,
      block.previousHash,
      block.nonce,
      block.merkleRoot,
    )

    if (block.hash !== recalculatedHash) {
      return false
    }

    // Validate proof of work
    if (!block.hash.startsWith("0".repeat(block.difficulty))) {
      return false
    }

    // Validate merkle root
    const recalculatedMerkleRoot = this.calculateMerkleRoot(block.transactions)
    if (block.merkleRoot !== recalculatedMerkleRoot) {
      return false
    }

    // Validate chain linkage
    if (previousBlock && block.previousHash !== previousBlock.hash) {
      return false
    }

    if (previousBlock && block.index !== previousBlock.index + 1) {
      return false
    }

    return true
  }

  static validateChain(blocks: Block[]): boolean {
    for (let i = 1; i < blocks.length; i++) {
      if (!this.validateBlock(blocks[i], blocks[i - 1])) {
        return false
      }
    }
    return true
  }

  static signTransaction(transaction: Transaction, privateKey: string): string {
    const data = JSON.stringify({
      id: transaction.id,
      from: transaction.from,
      to: transaction.to,
      data: transaction.data,
      timestamp: transaction.timestamp,
    })

    return createHash("sha256")
      .update(data + privateKey)
      .digest("hex")
  }

  static verifyTransaction(transaction: Transaction, publicKey: string): boolean {
    if (!transaction.signature) return false

    const data = JSON.stringify({
      id: transaction.id,
      from: transaction.from,
      to: transaction.to,
      data: transaction.data,
      timestamp: transaction.timestamp,
    })

    const expectedSignature = createHash("sha256")
      .update(data + publicKey)
      .digest("hex")
    return transaction.signature === expectedSignature
  }
}
