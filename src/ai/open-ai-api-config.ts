export interface GptApiConfig {
    model: string
    temperature: number
    max_tokens: number
}

// Generate conversation.
export const GENERATE_CONVERSATION_REQUEST_PARAMS: GptApiConfig = {
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 2000,
}

// Parse the plaintext conversation into JSON.
export const PARSE_CONVERSATION_REQUEST_PARAMS: GptApiConfig = {
    model: "gpt-4",
    temperature: 0,
    max_tokens: 2000,
}

// Generate questions for a given conversation.
export const GENERATE_QUESTIONS_REQUEST_PARAMS: GptApiConfig = {
    model: "gpt-4",
    temperature: 0.25,
    max_tokens: 2000,
}

// Generate character.
export const GENERATE_CHARACTER_REQUEST_PARAMS: GptApiConfig = {
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 2000,
}

// Generate next message of chat.
export const GENERATE_NEXT_CHAT_MESSAGE_REQUEST_PARAMS: GptApiConfig = {
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 1000,
}
