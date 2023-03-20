import { Language } from "../audio/voices"
import {
    getGenerateCharactersPromptMessage,
    getGenerateQuestionsPromptMessage,
    getGenerateConversationPromptMessages,
    getParseConversationPromptMessage,
} from "./prompts"
import {
    Character,
    Characters,
    CharacterWithLanguageConfig,
    Conversation,
    Question,
} from "../types/types"
import {
    GENERATE_CHARACTER_REQUEST_PARAMS,
    GENERATE_CONVERSATION_REQUEST_PARAMS,
    GENERATE_QUESTIONS_REQUEST_PARAMS,
    PARSE_CONVERSATION_REQUEST_PARAMS,
} from "./open-ai-api-config"
import { callChatCompletionApi } from "./open-ai-controller"

/**
 * Generates a new conversation using the OpenAI API in plaintext. This purposely returns plaintext rather than JSON because we had issues balancing creativity of generated conversation with strictness of output required so we've split out the JSON formatting into a later step which can use a different temperature on the API request.
 *
 * @param language The language of the conversation to generate.
 * @param characters The characters to use in the conversation.
 * @param turnCount The number of parts to the conversation, i.e. "turns" in the conversation.
 * @returns Generated conversation in plaintext.
 */
export async function generatePlaintextConversation(
    language: Language,
    characters: CharacterWithLanguageConfig[],
    turnCount: number
): Promise<string> {
    // Get the prompt to send to the API, needs to be in the ChatCompletion format described here: https://platform.openai.com/docs/guides/chat/introduction
    const messages = getGenerateConversationPromptMessages(
        language,
        characters,
        turnCount
    )

    // Call the API.
    const response = await callChatCompletionApi(
        GENERATE_CONVERSATION_REQUEST_PARAMS,
        messages
    )

    // Don't worry about the role part of the response, we just want the content.
    return response.content
}

/**
 * Generates some characters to use for the various app features using the OpenAI API.
 *
 * @param language The language of the characters to generate - assists with natural sounding names etc.
 * @param count The number of characters to generate at once.
 * @returns Parsed list of the generated characters.
 */
export async function generateCharacters(
    language: Language,
    count: number = 2
): Promise<Character[]> {
    // Get the prompt that we'll use to generate the characters.
    const message = getGenerateCharactersPromptMessage(language, count)

    // Call the API.
    const response = await callChatCompletionApi(
        GENERATE_CHARACTER_REQUEST_PARAMS,
        [message]
    )

    try {
        // We've asked the API to give us back some JSON - parse it to make sure it's the format we wanted.
        const characters: Characters = JSON.parse(response.content)
        return characters.characters
    } catch (e: any) {
        console.log("Failed to parse response from API")
        return []
    }
}

/**
 * Parses a plaintext conversation into a JSON format.
 *
 * @param conversation The conversation in plaintext to parse.
 * @returns The parsed conversation, or null if it was not in the required format.
 */
export async function parseConversation(
    conversation: string
): Promise<Conversation | null> {
    // Get the prompt we will use to parse the conversation.
    const message = getParseConversationPromptMessage(conversation)

    // Call the API.
    const response = await callChatCompletionApi(
        PARSE_CONVERSATION_REQUEST_PARAMS,
        [message]
    )

    try {
        // We've asked the API to give us back some JSON - parse it to make sure it's the format we wanted.
        const conversation: Conversation = JSON.parse(response.content)
        return conversation
    } catch (e: any) {
        console.log("Failed to parse response from API")
        return null
    }
}

/**
 * Generates some questions about the conversation which we can then use to test the user's comprehension.
 *
 * @param language The language that the questions should be output in.
 * @param conversation The plaintext conversation.
 * @param questionCount The number of questions to generate about the conversation.
 * @returns The parsed list of generated questions.
 */
export async function generateQuestionsForConversation(
    language: Language,
    conversation: string,
    questionCount: number
): Promise<Question[]> {
    // Get the prompt we'll use to generate the questions.
    const message = getGenerateQuestionsPromptMessage(
        language,
        conversation,
        questionCount
    )

    // Call the API.
    const response = await callChatCompletionApi(
        GENERATE_QUESTIONS_REQUEST_PARAMS,
        [message]
    )

    try {
        // We've asked the API to give us back some JSON - parse it to make sure it's the format we wanted.
        const questions: Question[] = JSON.parse(response.content)
        return questions
    } catch (e: any) {
        console.log("Failed to parse response from API")
        return []
    }
}
