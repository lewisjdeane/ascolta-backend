import express from "express"
import { ChatCompletionResponseMessage } from "openai"
import {
    getLiveChatResponse,
    seedNewLiveChat,
} from "../ai/live-chat-generation"
import { Language, LANGUAGES } from "../audio/voices"
import { getRandomCharacter } from "../db/character-controller"
import { CharacterWithLanguageConfig } from "../types/types"

const router = express.Router()

/**
 * ROUTE: /live/new
 *
 * Instantiate a new live chat for the given language.
 *
 * Expected URL query params:
 *   - language: The language code associated with the language we want the live chat in, e.g. 'it' for Italian
 *
 * Response: JSON object of the setup info associated with the live chat, namely: session ID and character
 */
router.get("/new", async function (req, res, next) {
    console.log("Received request on /live/new")

    const language = getLanguageFromRequest(req.query.language)
    const character = await getRandomCharacter(language)
    const sessionId: string = await seedNewLiveChat(character, language)

    const setup: LiveConversationSetup = { id: sessionId, character: character }

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send(JSON.stringify(setup))
})

/**
 * ROUTE: /live/new
 *
 * Generate a live chat response in response to user input.
 *
 * Expected body format: JSON
 *
 * Expected body params:
 *   - id: The session ID associated with this live chat.
 *   - text: The latest input from the user in the conversation
 *
 * Response: JSON object of the info associated with the live chat, namely: session ID and chat messages
 */
router.post("/next", async function (req, res) {
    console.log("Received request on /live/next")

    console.log(JSON.stringify(req.body))

    const sessionId = req.body.id
    const userInput: string = decodeURIComponent(req.body.text)

    res.setHeader("Access-Control-Allow-Origin", "*")
    try {
        const messages: ChatCompletionResponseMessage[] = await getLiveChatResponse(
            sessionId,
            userInput
        )
        const liveConversation: LiveConversationState = {
            id: sessionId,
            messages: messages,
        }
        const json = JSON.stringify(liveConversation)
        res.send(json)
    } catch (error) {
        // Hit an error while trying to generate a next message. API may be down or we may have exceeded context length, either way we respond with an error code.
        res.sendStatus(502)
    }
})

interface LiveConversationSetup {
    id: string
    character: CharacterWithLanguageConfig
}

interface LiveConversationState {
    id: string
    messages: ChatCompletionResponseMessage[]
}

function getLanguageFromRequest(
    param: string | undefined
): Language | undefined {
    return LANGUAGES.find((language) => language.code === param)
}

export default router
