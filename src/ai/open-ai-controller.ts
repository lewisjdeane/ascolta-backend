import {
    ChatCompletionRequestMessage,
    ChatCompletionRequestMessageRoleEnum,
    Configuration,
    OpenAIApi,
} from "openai"
import config from "../config/config"
import { ResultMonad } from "../types/types"
import { GptApiConfig } from "./open-ai-api-config"

const configuration = new Configuration({ apiKey: config.OPEN_AI_API_KEY })
const openai = new OpenAIApi(configuration)

/**
 * Calls the OpenAI's Chat Completion API to generate a response.
 *
 * @param config Request-specific config containing information about the max-tokens, temperature etc. for this request.
 * @param messages The messages to send to the API as the prompt.
 * @returns A message object containing the API response.
 */
export async function callChatCompletionApi(
    config: GptApiConfig,
    messages: ChatCompletionRequestMessage[]
): Promise<ResultMonad<ChatCompletionRequestMessage>> {
    try {
        const response = await openai.createChatCompletion({
            model: config.model,
            messages: messages,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
        })
        return ResultMonad.success(response.data.choices[0].message)
    } catch (error) {
        console.error(error)
        return ResultMonad.failure(502)
    }
}

/**
 * Helper function to wrap the given prompt into the format required by OpenAI's Chat Completion API.
 *
 * @param prompt The prompt that we wish to send.
 * @param role The person saying this prompt, which is the user by default, but we can be specified for the use case where we wish to prime the AI using the sytem role instead
 * @returns The OpenAI message format for the prompt required by the Chat Completion API.
 */
export function getMessageFormatForPrompt(
    prompt: string,
    role: ChatCompletionRequestMessageRoleEnum = ChatCompletionRequestMessageRoleEnum.User
): ChatCompletionRequestMessage {
    const message: ChatCompletionRequestMessage = {
        role: role,
        content: prompt,
    }
    return message
}
