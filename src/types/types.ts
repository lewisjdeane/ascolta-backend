export interface Characters {
    characters: Character[]
}

export interface Character {
    name: string
    gender: string
    age: number
    occupation: string
}

export interface CharacterWithLanguageConfig {
    name: string
    gender: string
    age: number
    occupation: string
    avatar_url: string | null
    language_config: LanguageConfig
}

export interface CharacterWithId {
    _id: string
    name: string
    gender: string
    age: number
    occupation: string
    avatar_url: string
    language_config: LanguageConfig
}

export interface LanguageConfig {
    language: string
    voice: string
    speed: string
    pitch: string
}

export interface Conversation {
    parts: ConversationPart[]
    location: string | null
    title: string | null
}

export interface ConversationPart {
    name: string
    text: string
}

export interface Question {
    question: string
    answer: Answer[]
}

export interface Answer {
    answer: string
    is_correct: boolean
}

export interface ConversationDocument {
    characters: CharacterWithLanguageConfig[]
    parts: ConversationPart[]
    questions: Question[]
    audio: string
    location: string
    title: string
    language_code: string
    length: string
}

export interface ConversationDocumentWithId {
    _id: string
    characters: CharacterWithLanguageConfig[]
    parts: ConversationPart[]
    questions: Question[]
    audio: string
    location: string
    title: string
    language_code: string
    length: string
}

export interface ConversationPartWithAudio {
    index: number
    character: Character
    text: string
    audio_file: string | null
}

export interface CompressedConversation {
    id: string
    characters: Character[]
    location: string
    title: string
    language: string
    length: string
    audio: string | null
}

export interface OpenAIChatMessage {
    role: string
    content: string
}

export interface ConversationType {
    param: string
    questionCount: number
    turnCount: number
}

export const CONVERSATION_TYPES: ConversationType[] = [
    { param: "short", questionCount: 3, turnCount: 10 },
    { param: "medium", questionCount: 5, turnCount: 20 },
    { param: "long", questionCount: 7, turnCount: 30 },
]
