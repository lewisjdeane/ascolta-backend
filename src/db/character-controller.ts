import { Document, WithId } from "mongodb"
import { CharacterWithId, CharacterWithLanguageConfig } from "../types/types"
import { stripIdFromCharacter } from "../converters"
import { Language } from "../audio/voices"
import { random } from "../helper"
import config from "../config/config"
import { getCollection } from "./database-controller"

/**
 * Inserts a character object into the database.
 *
 * @param character The character to insert.
 */
export async function insertCharacter(character: CharacterWithLanguageConfig) {
    console.log(`Adding ${character.name} to the database`)
    const collection = await getCollection(
        config.MONGO_CHARACTERS_COLLECTION_NAME
    )
    await collection.insertOne(character)

    console.log(`Successfully added ${character.name} to the database`)
}

/**
 * Gets a random character from the database
 *
 * @param language The language of the character to filter by
 * @returns A random character with the given language
 */
export async function getRandomCharacter(
    language: Language
): Promise<CharacterWithLanguageConfig> {
    console.log(
        `Get random character from database for language: ${language.readable}`
    )

    const collection = await getCollection(
        config.MONGO_CHARACTERS_COLLECTION_NAME
    )
    const query = { "language_config.language": language.code }
    const characters: WithId<Document>[] = await collection
        .find(query)
        .toArray()

    const randomDocument: WithId<Document> = random(characters)
    const characterWithId: CharacterWithId = JSON.parse(
        JSON.stringify(randomDocument)
    )
    return stripIdFromCharacter(characterWithId)
}
