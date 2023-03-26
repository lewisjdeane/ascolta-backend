import express from "express"
import {
    getAllConversations,
    getConversationWithId,
    getRandomConversation,
    insertConversation,
} from "../db/conversation-controller"
import {
    CharacterWithLanguageConfig,
    CompressedConversation,
    Conversation,
    ConversationDocument,
    ConversationDocumentWithId,
    ConversationType,
    CONVERSATION_TYPES,
    Question,
    ResultMonad,
} from "../types/types"
import { Language, LANGUAGES } from "../audio/voices"
import { getRandomCharacter } from "../db/character-controller"
import { generateAudioForConversation } from "../audio/audio-controller"
import {
    generatePlaintextConversation,
    generateQuestionsForConversation,
    parseConversation,
} from "../ai/conversation-generation"

const router = express.Router()

/**
 * ROUTE: /conversation/new
 *
 * Generate a new conversation for the given language and length.
 *
 * Expected URL query params:
 *   - language: The language code associated with the language we want the conversation in, e.g. 'it' for Italian
 *   - length: The length of the conversation to generate, one of: "short", "medium", "long"
 *
 * Response: JSON object of generated conversation
 */
router.get("/new", async function (req, res, next) {
    console.log("Received request on /conversations/new")
    res.setHeader("Access-Control-Allow-Origin", "*")

    const language = getLanguageFromRequest(req.query.language)
    const length = getLengthFromRequest(req.query.length)

    if (language === undefined) {
        res.send("Error: No language specified")
    } else if (length === undefined) {
        res.send("Error: No conversation length specified")
    }

    const result: ResultMonad<ConversationDocument> =
        await generateFullConversation(language, length)

    if (result.isSuccess) {
        const conversation = result.getSuccessData()
        const json = JSON.stringify(conversation)
        res.send(json)
    } else {
        const responseCode = result.getFailureCode()
        res.sendStatus(responseCode)
    }
})

/**
 * ROUTE: /conversation/list
 *
 * List all the conversations in the database
 *
 * Response: JSON object of all conversations
 */
router.get("/list", async function (req, res, next) {
    console.log("Received request on /conversations/list")
    const conversations: ConversationDocumentWithId[] =
        await getAllConversations()
    const compressedConversations: CompressedConversation[] = conversations.map(
        (conversation) => {
            const compressed: CompressedConversation = {
                id: conversation._id,
                characters: conversation.characters,
                location: conversation.location,
                title: conversation.title,
                language: conversation.language_code,
                length: conversation.length,
                audio: conversation.audio,
            }
            return compressed
        }
    )
    const json = JSON.stringify(compressedConversations)
    console.log(`Got the following list of conversations:\n\n${json}\n`)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send(json)
})

/**
 * ROUTE: /conversation/random
 *
 * Get a random conversation from the database
 *
 * Response: JSON object of a random conversation
 */
router.get("/random", async function (req, res, next) {
    console.log("Received request on /conversations/random")
    const conversationId: string = await getRandomConversation()
    console.log(`Got the following random conversation ID: ${conversationId}\n`)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send(conversationId)
})

/**
 * ROUTE: /conversation/id/:id
 *
 * Get a conversation with a given ID from the database
 *
 * Response: JSON object of the conversation with the ID specified in the URL path parameters
 */
router.get("/id/:id", async function (req, res, next) {
    console.log("Received request on /conversations/id")
    const id = req.params.id
    const conversation: ConversationDocument = await getConversationWithId(id)
    const conversationJson = JSON.stringify(conversation)
    console.log(
        `Got the following random conversation:\n\n${conversationJson}\n`
    )
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send(conversationJson)
})

function getLanguageFromRequest(
    param: string | undefined
): Language | undefined {
    return LANGUAGES.find((language) => language.code === param)
}

function getLengthFromRequest(
    param: string | undefined
): ConversationType | undefined {
    return CONVERSATION_TYPES.find((item) => item.param === param)
}

async function generateFullConversation(
    language: Language,
    conversationType: ConversationType
): Promise<ResultMonad<ConversationDocument>> {
    console.log(`Generating a conversation in ${language.readable}`)

    // Get two characters.
    const characters = await getRandomCharacters(language)

    console.log(
        `Chose two characters for the conversation: ${characters[0].name} and ${characters[1].name}`
    )

    // Generate plaintext conversation.
    const conversationPlaintextResult: ResultMonad<string> =
        await generatePlaintextConversation(
            language,
            characters,
            conversationType.turnCount
        )

    if (conversationPlaintextResult.isFailure) {
        console.log(`Hit error generating plaintext conversation`)
        return conversationPlaintextResult.cloneFailure()
    }

    const conversationPlaintext = conversationPlaintextResult.getSuccessData()
    console.log(
        `Generated plaintext conversation:\n\n${conversationPlaintext}\n`
    )

    // Get questions.
    console.log("Generate questions for conversation")
    const questionsPromise: Promise<ResultMonad<Question[]>> =
        generateQuestionsForConversation(
            language,
            conversationPlaintext,
            conversationType.questionCount
        )

    // Get JSON conversation.
    const conversationJsonPromise: Promise<ResultMonad<Conversation>> =
        parseConversation(conversationPlaintext)

    const [questionsResult, conversationJsonResult] = await Promise.all([
        questionsPromise,
        conversationJsonPromise,
    ])

    if (questionsResult.isFailure) {
        console.log(`Hit error generating questions for conversation`)
        return questionsResult.cloneFailure()
    } else if (conversationJsonResult.isFailure) {
        console.log(`Hit error parsing conversation into JSON`)
        return conversationJsonResult.cloneFailure()
    }

    const questions = questionsResult.getSuccessData()
    const conversationJson = conversationJsonResult.getSuccessData()

    // Generate audio for conversations parts and add them in.
    const audioLink: string = await generateAudioForConversation(
        characters,
        conversationJson.parts
    )

    console.log(`Generated audio for conversation: ${audioLink}`)

    // Stick in shiny JSON object with characters.
    const document: ConversationDocument = {
        characters: characters,
        parts: conversationJson.parts,
        questions: questions,
        audio: audioLink,
        location: conversationJson.location,
        title: conversationJson.title,
        language_code: language.code,
        length: conversationType.param,
    }

    console.log("Generated document to go into database")

    insertConversation(document)

    return ResultMonad.success(document)
}

async function getRandomCharacters(
    language: Language
): Promise<CharacterWithLanguageConfig[]> {
    console.log("Get random character in language: " + language.readable)
    const character1 = await getRandomCharacter(language)
    var character2 = await getRandomCharacter(language)

    // Prevent confusing conversations with same voice or name.
    while (
        character1.language_config.voice === character2.language_config.voice ||
        character1.name === character2.name
    ) {
        character2 = await getRandomCharacter(language)
    }

    return [character1, character2]
}

export default router
