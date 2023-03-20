import {
    CharacterWithId,
    CharacterWithLanguageConfig,
    ConversationDocument,
    ConversationDocumentWithId,
} from "./types/types"

/**
 * The character object document returned from the Azure Cosmos DB contains an ID field which we want to strip
 * off so we can consistent types for all business logic to do with characters.
 *
 * @param characterWithId The character object returned from Azure Cosmos DB which contains an ID field.
 * @returns The character object with the ID stripped out.
 */
export function stripIdFromCharacter(
    characterWithId: CharacterWithId
): CharacterWithLanguageConfig {
    const stripped: CharacterWithLanguageConfig = {
        name: characterWithId.name,
        gender: characterWithId.gender,
        age: characterWithId.age,
        occupation: characterWithId.occupation,
        avatar_url: characterWithId.avatar_url,
        language_config: characterWithId.language_config,
    }
    return stripped
}

/**
 * The conversation object document returned from the Azure Cosmos DB contains an ID field which we want to strip
 * off so we can consistent types for all business logic to do with conversations.
 *
 * @param conversationWithId The conversation object returned from Azure Cosmos DB which contains an ID field.
 * @returns The conversation object with the ID stripped out.
 */
export function stripIdFromConversation(
    conversationWithId: ConversationDocumentWithId
): ConversationDocument {
    const stripped: ConversationDocument = {
        characters: conversationWithId.characters,
        parts: conversationWithId.parts,
        questions: conversationWithId.questions,
        audio: conversationWithId.audio,
        location: conversationWithId.location,
        title: conversationWithId.title,
        language_code: conversationWithId.language_code,
        length: conversationWithId.length,
    }
    return stripped
}
