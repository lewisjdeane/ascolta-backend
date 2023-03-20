import { Db, MongoClient } from "mongodb"
import config from "../config/config"

const client = new MongoClient(config.MONGO_DB_CONNECTION_STRING)
var cachedDatabase: Db

/**
 * Gets a singleton database object by returning the cached version or instantiating one if there is no cached version.
 *
 * @returns The database object to use for CRUD actions later.
 */
async function getDatabase(): Promise<Db> {
    if (cachedDatabase) {
        console.log("Already have a database connection")
        return cachedDatabase
    }

    console.log("Don't have a database connection yet, go get one")
    try {
        const connectedClient = await client.connect()
        cachedDatabase = await connectedClient.db(config.MONGO_DB_NAME)
        console.log("Successfully got database connection")
        return cachedDatabase
    } catch (error) {
        console.log(`Failed to get database connection with error:\n${error}`)
        throw error
    }
}

/**
 * Gets a collection from the database.
 *
 * @param collectionName The name of collection to find
 * @returns The collection in the database
 */
export async function getCollection(collectionName: string) {
    const database = await getDatabase()
    return database.collection(collectionName)
}
