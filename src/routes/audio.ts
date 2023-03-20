import express from "express"
import { generateEnglishAudioForText } from "../audio/audio-controller"

const router = express.Router()

/**
 * ROUTE: /audio/new
 *
 * Performs a TTS request for the given piece of text and returns a URL to the generated audio file.
 *
 * Expected URL query params:
 *   - text: A URL encoded string of the text to perform TTS on
 */
router.get("/new", async function (req, res, next) {
    console.log("Received request on /audio/new")
    const text = req.query.text
    const decoded = decodeURIComponent(text)

    const link = await generateEnglishAudioForText(decoded)

    console.log(`Generated audio the following link: ${link}\n`)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send(link)
})

export default router
