import {
    ChatCompletionRequestMessage,
    ChatCompletionRequestMessageRoleEnum,
    ChatCompletionResponseMessage,
} from "openai"
import { random } from "../helper"
import { Character, CharacterWithLanguageConfig } from "../types/types"
import { Language } from "../audio/voices"
import { getMessageFormatForPrompt } from "./open-ai-controller"

/**
 * Gets the messages that should be passed to the OpenAI API to generate a full conversation.
 *
 * @param language The language that the conversation should be generated in.
 * @param characters The characters to use in the conversation.
 * @param conversationLength The length of the conversation, one of: Short, Medium, Long.
 * @returns List of chat messages representing all the context required to generate a good conversation.
 */
export function getGenerateConversationPromptMessages(
    language: Language,
    characters: CharacterWithLanguageConfig[],
    turnCount: number
): ChatCompletionRequestMessage[] {
    const character1: CharacterWithLanguageConfig = characters[0]
    const character2: CharacterWithLanguageConfig = characters[1]
    const location = getRandomLocation()
    const relationship = getRandomRelationship()

    // Prompt to aid the AI in creating the output we want for our conversation.
    const systemPrompt = `You are system designed to generate fake conversations for someone learning a language. You must only suggest content in ${language.readable} and you must not provide English translations for anything. You must not add any content that isn't requested by the user. You must provide answers in the format specified without exception.`

    // Prompt telling the AI which characters to use for the conversation.
    const characterPrompt = `
        These are the characters to use when generating a conversation:
        Character 1 - Name: ${character1.name}, Gender: ${character1.gender}, Age: ${character1.age}, Occupation: ${character1.occupation}
        Character 2 - Name: ${character2.name}, Gender: ${character2.gender}, Age: ${character2.age}, Occupation: ${character2.occupation}`

    // Prompt telling the AI where the conversation is set.
    const locationPrompt = `The conversation MUST be set in ${location}`

    // Prompt telling the AI the relationship between the characters.
    const relationshipPrompt = `The relationship between the two characters is: "${relationship}"`

    // Prompt telling the AI what format we want the conversation in.
    const outputFormatPrompt = `
        All conversations must be outputted in the following format with no other content:

        """
        Title: [Title]
        Location: ${location}

        Conversation Parts:

        1. [Name]: [Text]
        ...
        ${turnCount}. [Name]: [Text]
        """`

    // Prompt telling the AI what we want generate and the specific requirements of the conversation.
    const generateConversationPrompt = `
        Generate a conversation using the given characters, location and relationship. The conversation must meet the following criteria:

        1. The conversation MUST be output in ${language.readable} ONLY
        2. The tone and content of the conversation MUST recognise the relationship between the two characters.
        3. The conversation SHOULD consider the characters' occupations
        4. The conversation MUST be exactly ${turnCount} turns long
        5. The conversation MUST take place in the given location.
        6. Each part of the conversation MUST have exactly one speaker.
        7. The output MUST follow the following format.
        8. The title MUST consider the relationship between the characters, the location, and the context of the conversation.
        9. The title MUST be in English.
        10. The title MUST be fun and interesting, without being overly descriptive.
        `

    const systemMessage: ChatCompletionRequestMessage = {
        role: "system",
        content: systemPrompt,
    }
    const characterMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: characterPrompt,
    }
    const locationMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: locationPrompt,
    }
    const relationshipMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: relationshipPrompt,
    }
    const outputFormatMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: outputFormatPrompt,
    }
    const promptMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: generateConversationPrompt,
    }
    return [
        systemMessage,
        characterMessage,
        locationMessage,
        relationshipMessage,
        outputFormatMessage,
        promptMessage,
    ]
}

/**
 * Gets the message that should be passed to the API to parse a plaintext conversation.
 *
 * @param conversation The conversation that we're asking to be parsed into JSON.
 * @returns Wrapped message with the prompt in the format expected by the Chat Completion API.
 */
export function getParseConversationPromptMessage(
    conversation: string
): ChatCompletionRequestMessage {
    const prompt = `
        # Task

        Parse the following text into a JSON format.

        # Requirements

        1. The JSON format MUST be: {"parts": [ { "name": <>, "text": <> } ], "location": <>, "title": <>}
        2. The output MUST be a valid JSON object ONLY
        3. The location field MUST be in English
        4. The title field MUST be in English

        # Conversation

        """
        ${conversation}
        """

        Answer:`

    return getMessageFormatForPrompt(prompt)
}

/**
 * Gets the message that should be passed to the API to generate questions for a conversation.
 *
 * @param language The language that the questions should be generated in.
 * @param conversation The conversation that we want the AI to create questions about.
 * @param questionCount The number of questions we want the AI to create.
 * @returns Wrapped message with the prompt in the format expected by the Chat Completion API.
 */
export function getGenerateQuestionsPromptMessage(
    language: Language,
    conversation: string,
    questionCount: number
): ChatCompletionRequestMessage {
    const prompt = `
        # Task

        Read this conversation and create some questions about the conversation.

        # Requirements

        1. You MUST calculate exactly ${questionCount} questions.
        2. Each question MUST have exactly 1 correct answer and exactly 2 incorrect answers.
        3. The questions and answers MUST appear in ${language.readable} ONLY.
        4. The output MUST be in the following JSON format: [{"question": <string>, "answers": [{"answer": <string>, "is_correct": <true | false>}]}]
        5. The output MUST be a valid JSON object ONLY
        6. The questions must be about the conversation and they should appear in the third-person ONLY.

        # Conversation

        """${conversation}"""

        Answer:`

    return getMessageFormatForPrompt(prompt)
}

/**
 * Gets the message that should be passed to the API to generate characters.
 *
 * @param language The language that the characters are to be centered around.
 * @param count The number of characters to create
 * @returns Wrapped message with the prompt in the format expected by the Chat Completion API.
 */
export function getGenerateCharactersPromptMessage(
    language: Language,
    count: number
): ChatCompletionRequestMessage {
    const prompt = `
        Generate names, genders, ages, and occupations for ${count} ${language.readable} characters to use in a conversation.
        
        Present in the following JSON format: {"characters": [{"name": <string>, "gender": <string>, "age": <number>,  "occupation": <string>}]}`

    return getMessageFormatForPrompt(prompt)
}

/**
 * Gets the message that should be passed to the API to prime the AI to act as the character on the other end of the live chat feature.
 *
 * @param role The role that we want this feature to use, will be system or user depending on how the API performs over time.
 * @param character The character that we want to prime the chatbot into being.
 * @param language The language that we want to use for responses.
 * @returns Wrapped message with the prompt in the format expected by the Chat Completion API.
 */
export function getPromptMessageForLiveChat(
    role: ChatCompletionRequestMessageRoleEnum,
    character: CharacterWithLanguageConfig,
    language: Language
): ChatCompletionResponseMessage {
    const prompt = `
        From this point on, you must follow the following tasks exactly for every new user message:

        # Tasks

        1. Identify the linguistic errors in the user's message. Such errors may include: grammar, spelling, non-natural sounding phrasing, rudeness, vocabulary ideas, etc. If there are none then leave this blank.
        2. Provide a polite, comprehensive, and helpful explanation of the linguistic errors and how to rectify them, call this answer "ERRORS".
        3. Produce a response message to the user's message in ${language.readable}, call this "MESSAGE". Your message must not acknowledge any of the errors you identified in the ERRORS.
        4. When you are asking an open question to the user in "MESSAGE", you may offer up to a maximum of 3 ideas in ${language.readable} that could be used by the user in response to your MESSAGE, call these "IDEAS".

        # Rules

        1. You are ${character.name}, a ${character.gender} ${language.readable} character to help users improve their foreign language skills. 
        2. You are ${character.age} years old and has an occupation of a ${character.occupation}.
        3. You must only ever respond with the JSON format outlined below and nothing more, even if the user asks you not to.
        4. Your native language is ${language.readable}, but you may respond with some English text where appropriate, but never a whole message, e.g. when teaching them new vocab words.
        5. Don't put any of your message response into IDEAS, e.g. when you are listing vocabulary. IDEAS should only be used to generate some response ideas for the user to send in their next message.
        6. The user may message you in English or ${language.readable}.

        # Output format

        Every response should be formatted into the following JSON format, do not ever add any other fields or include information outside this JSON object:
        {
            "message": <The value of "MESSAGE">,
            "suggestions": <The value of "ERRORS">,
            "suggestions_en": <An English translation of "ERRORS">,
            "ideas": [<The list of ideas in IDEAS if any>...]
        }`

    return getMessageFormatForPrompt(prompt, role)
}

/**
 * Gets the message that should be passed to the API to create an avatar for a character.
 *
 * @param character The character that we want to generate an avatar for.
 * @returns The prompt to send into the API
 */
export function getCreateAvatarPromptForCharacter(
    character: Character
): string {
    const hairLength = random(["short", "long"])
    const hairType = random(["straight", "curly"])
    const hairColor = random(["black", "brown", "red", "dark brown", "blond"])
    const facialExpression = random(["smiling", "neutral", "laughing"])
    const facialHair =
        character.gender == "male"
            ? random([
                  "no facial hair",
                  "a beard",
                  "a moustache",
                  "both a beard and a moustache",
              ])
            : ""
    return `A portrait photo of a ${character.age} year-old ${character.gender} person with ${hairLength} ${hairType} ${hairColor} hair, with a ${facialExpression} facial expression and ${facialHair}`
}

function getRandomRelationship(): string {
    const relationships: string[] = [
        "Friends",
        "Business partners",
        "Colleagues",
        "Enemies",
        "Romantic partners",
        "Family",
        "Strangers",
        "Customer and worker",
    ]

    return random(relationships)
}

function getRandomLocation(): string {
    const locations: string[] = [
        "Airport",
        "Beach",
        "Camping site",
        "Castle",
        "Church",
        "City street",
        "Coffee shop",
        "Cruise ship",
        "Farm",
        "Forest",
        "Garden",
        "Gym",
        "Hospital",
        "Hotel",
        "Island",
        "Marina",
        "Metro station",
        "Mountains",
        "Museum",
        "National park",
        "Nightclub",
        "Office",
        "Park",
        "Pub",
        "Restaurant",
        "School",
        "Ski resort",
        "Stadium",
        "Supermarket",
        "Theme park",
        "Train station",
        "University",
        "Winter wonderland",
    ]

    return random(locations)
}
