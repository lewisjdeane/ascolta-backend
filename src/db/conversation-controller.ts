import { Collection, Document, WithId } from "mongodb"
import {
    ConversationDocument,
    ConversationDocumentWithId,
} from "../types/types"
import { stripIdFromConversation } from "../converters"
import { random } from "../helper"
import config from "../config/config"
import { getCollection } from "./database-controller"

/**
 * Inserts a conversation object into the database.
 *
 * @param conversation The conversation to insert.
 */
export async function insertConversation(conversation: ConversationDocument) {
    console.log(
        `Adding conversation between ${conversation.characters[0].name} and ${conversation.characters[1].name} to the database`
    )
    const collection = await getCollection(
        config.MONGO_CONVERSATIONS_COLLECTION_NAME
    )
    await collection.insertOne(conversation)

    console.log(
        `Successfully added conversation between ${conversation.characters[0].name} and ${conversation.characters[1].name} to the database`
    )
}

/**
 * Gets a random conversation from the database
 *
 * @returns A random conversation from the database
 */
export async function getRandomConversation(): Promise<string> {
    console.log(`Get random conversation from database`)
    const collection = await getCollection(
        config.MONGO_CONVERSATIONS_COLLECTION_NAME
    )
    const conversations: WithId<Document>[] = await collection.find().toArray()
    return random(conversations)._id.toString()
}

/**
 * Gets a conversation with the a given ID from the database
 *
 * @param id The conversation ID to find by
 * @returns The conversation with the given ID in the database
 */
export async function getConversationWithId(
    id: string
): Promise<ConversationDocument> {
    console.log(`Get conversation from database with id: ${id}`)

    const collection: Collection<Document> = await getCollection(
        config.MONGO_CONVERSATIONS_COLLECTION_NAME
    )
    const conversations: WithId<Document>[] = await collection.find().toArray()
    const document: WithId<Document> = getDocumentWithId(conversations, id)
    const conversationWithId: ConversationDocumentWithId = JSON.parse(
        JSON.stringify(document)
    )
    return stripIdFromConversation(conversationWithId)
}

/**
 * Gets a list of all conversations from the database
 *
 * @returns A list of all conversations in the database
 */
export async function getAllConversations(): Promise<
    ConversationDocumentWithId[]
> {
    console.log("Get all conversations from database")
    const collection = await getCollection(
        config.MONGO_CONVERSATIONS_COLLECTION_NAME
    )
    const conversations: WithId<Document>[] = await collection.find().toArray()
    const conversationsWithId: ConversationDocumentWithId[] = JSON.parse(
        JSON.stringify(conversations)
    )
    return conversationsWithId
}

/**
 * Helper function to find a MongoDB document with a given ID from a list of documents.
 *
 * @param items A list of documents to search through.
 * @param id The ID to search for
 * @returns The document with the matching ID
 */
function getDocumentWithId(
    items: WithId<Document>[],
    id: string
): WithId<Document> {
    return items.find((item) => item._id.toString() == id)
}
