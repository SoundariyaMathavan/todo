const { MongoClient } = require("mongodb")

async function setupDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("decentralized_todo")

    // Create collections with indexes
    const collections = [
      {
        name: "users",
        indexes: [
          { key: { email: 1 }, unique: true },
          { key: { id: 1 }, unique: true },
        ],
      },
      {
        name: "chains",
        indexes: [{ key: { userId: 1 }, unique: true }],
      },
      {
        name: "tasks",
        indexes: [{ key: { userId: 1 } }, { key: { id: 1 }, unique: true }, { key: { blockHash: 1 } }],
      },
      {
        name: "sessions",
        indexes: [
          { key: { token: 1 }, unique: true },
          { key: { userId: 1 } },
          { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
        ],
      },
    ]

    for (const collection of collections) {
      // Create collection
      await db.createCollection(collection.name)
      console.log(`Created collection: ${collection.name}`)

      // Create indexes
      for (const index of collection.indexes) {
        await db.collection(collection.name).createIndex(index.key, {
          unique: index.unique || false,
          expireAfterSeconds: index.expireAfterSeconds,
        })
        console.log(`Created index on ${collection.name}:`, index.key)
      }
    }

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Database setup failed:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
