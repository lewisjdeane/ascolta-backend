import {
    ChatCompletionRequestMessageRoleEnum,
    ChatCompletionResponseMessage,
} from "openai"
import { Language } from "../audio/voices"
import { CharacterWithLanguageConfig, ResultMonad } from "../types/types"
import { GENERATE_NEXT_CHAT_MESSAGE_REQUEST_PARAMS } from "./open-ai-api-config"
import {
    callChatCompletionApi,
    getMessageFormatForPrompt,
} from "./open-ai-controller"
import uuidv1 from "uuidv1"
import { getPromptMessageForLiveChat } from "./prompts"

// Define a message store HashMap which will track live sessions against their conversation history.
const messageStore = {}

/**
 * Seed a new live chat by generating a session ID which can be associated with the conversation going forwards.
 *
 * @param character The character that the user will be chatting with.
 * @param language The language that the user and character will be speaking with.
 * @returns The session ID (UUID) of the conversation to use.
 */
export async function seedNewLiveChat(
    character: CharacterWithLanguageConfig,
    language: Language
): Promise<string> {
    // Generate a new session ID for this conversation to use.
    const sessionId = uuidv1()

    // Get the system message to "prime" the API for how to respond as if they are the character.
    const systemMessage: ChatCompletionResponseMessage =
        getPromptMessageForLiveChat(
            ChatCompletionRequestMessageRoleEnum.System,
            character,
            language
        )

    // Save off the system message to use when the user sends their first message.
    messageStore[sessionId] = [systemMessage]

    return sessionId
}

/**
 * Gets the character's response to a user's message.
 *
 * @param sessionId The session ID associated with this conversation.
 * @param userInput The last message from the user.
 * @returns A full list of the conversation history which will contain the character's reply in response to the user's message.
 */
export async function getLiveChatResponse(
    sessionId: string,
    userInput: string
): Promise<ResultMonad<ChatCompletionResponseMessage[]>> {
    // Get the message history for this session.
    var messages: ChatCompletionResponseMessage[] = messageStore[sessionId]

    // Add the user's latest message to the list.
    const newMessage: ChatCompletionResponseMessage =
        getMessageFormatForPrompt(userInput)
    messages = [...messages, newMessage]
    messageStore[sessionId] = messages

    // Generate a response from the OpenAI API and add it to message list.
    const result = await callChatCompletionApi(
        GENERATE_NEXT_CHAT_MESSAGE_REQUEST_PARAMS,
        messages
    )

    return result.mapSuccess((success) => {
        const finalMessages = [...messages, success]
        messageStore[sessionId] = finalMessages
        return finalMessages
    })
}
