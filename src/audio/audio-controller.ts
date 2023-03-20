import * as speechSdk from "microsoft-cognitiveservices-speech-sdk"
import {
    SpeechSynthesisOutputFormat,
    SpeechSynthesisResult,
    SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk"
import uuidv1 from "uuidv1"
import fs from "fs"
import { CharacterWithLanguageConfig, ConversationPart } from "../types/types"
import config from "../config/config"
import { uploadAudioFileToContainer } from "../storage/storage-controller"

/**
 * Generates and uploads to Azure an audio file for a whole conversation.
 *
 * @param characters The characters in the conversation with their TTS config
 * @param parts The parts of the conversation that we want audio for.
 * @returns The URL of the generated audio file after it's been uploaded to Azure.
 */
export async function generateAudioForConversation(
    characters: CharacterWithLanguageConfig[],
    parts: ConversationPart[]
): Promise<string | null> {
    return new Promise((resolve) => {
        const temporaryFilePath = generateRandomFilePath()
        const speechSynthesizer = getSpeechSynthesizer(temporaryFilePath)

        const onResult = getOnResult(
            temporaryFilePath,
            speechSynthesizer,
            resolve
        )
        const onError = getOnError(
            temporaryFilePath,
            speechSynthesizer,
            resolve
        )

        const ssml = getSSMLForConversation(characters, parts)
        synthesizeAudioFromSSML(speechSynthesizer, ssml, onResult, onError)
    })
}

/**
 * Generates an audio file for a given piece of text and TTS voice.
 * @param text The text to perform TTS on.
 * @param voiceName The TTS voice to use.
 * @returns The URL of the generated audio file after it's been uploaded to Azure.
 */
export async function generateAudioForText(
    text: string,
    voiceName: string
): Promise<string | null> {
    console.log(`Generating audio for text '${text}' with voice '${voiceName}'`)
    return new Promise((resolve) => {
        const temporaryFilePath = generateRandomFilePath()
        const speechSynthesizer = getSpeechSynthesizer(
            temporaryFilePath,
            voiceName
        )

        const onResult = getOnResult(
            temporaryFilePath,
            speechSynthesizer,
            resolve
        )
        const onError = getOnError(
            temporaryFilePath,
            speechSynthesizer,
            resolve
        )

        synthesizeAudioFromText(speechSynthesizer, text, onResult, onError)
    })
}

/**
 * Helper function to support easy TTS for english text.
 *
 * @param text The text to perform TTS on.
 * @returns The URL of the generated audio file after it's been uploaded to Azure.
 */
export async function generateEnglishAudioForText(
    text: string
): Promise<string | null> {
    return generateAudioForText(text, "en-GB-AbbiNeural")
}

async function synthesizeAudioFromText(
    speechSynthesizer: SpeechSynthesizer,
    text: string,
    onResult: (SpeechSynthesisResult) => void,
    onError: (string) => void
) {
    speechSynthesizer.speakTextAsync(text, onResult, onError)
}

async function synthesizeAudioFromSSML(
    speechSynthesizer: SpeechSynthesizer,
    ssml: string,
    onResult: (SpeechSynthesisResult) => void,
    onError: (string) => void
) {
    speechSynthesizer.speakSsmlAsync(ssml, onResult, onError)
}

function getSSMLForConversation(
    characters: CharacterWithLanguageConfig[],
    parts: ConversationPart[]
) {
    const ssmlParts = parts
        .map((part) => {
            const matchingCharacter: CharacterWithLanguageConfig =
                characters.find((char) => char.name === part.name)
            return `<voice name="${matchingCharacter.language_config.voice}"><prosody pitch="${matchingCharacter.language_config.pitch}" rate="${matchingCharacter.language_config.speed}">${part.text}</prosody></voice>`
        })
        .join("\n")
    const ssml = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        ${ssmlParts}
    </speak>`

    console.log(`SSML:\n\n${ssml}\n`)
    return ssml
}

function getSpeechSynthesizer(
    filePath: string,
    voiceName: string | null = null
): SpeechSynthesizer {
    const speechConfig = speechSdk.SpeechConfig.fromSubscription(
        config.AZURE_SPEECH_KEY,
        config.AZURE_SPEECH_REGION
    )
    speechConfig.speechSynthesisOutputFormat =
        SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    const audioConfig = speechSdk.AudioConfig.fromAudioFileOutput(filePath)

    if (voiceName != null) {
        speechConfig.speechSynthesisVoiceName = voiceName
    }

    return new speechSdk.SpeechSynthesizer(speechConfig, audioConfig)
}

function getOnResult(
    filePath: string,
    speechSynthesizer: SpeechSynthesizer,
    resolve: (string) => void
) {
    return async (result: SpeechSynthesisResult) => {
        if (result.errorDetails) {
            console.log(`Failed to generate audio: ${result.errorDetails}`)
            cleanup(filePath, speechSynthesizer)
            resolve(null)
        } else {
            console.log("Successfully generated audio")
            const link = await uploadAudioFileToContainer(filePath)
            cleanup(filePath, speechSynthesizer)
            resolve(link)
        }
    }
}

function getOnError(
    filePath: string,
    speechSynthesizer: SpeechSynthesizer,
    resolve: (string) => void
) {
    return (error: string) => {
        console.log(error)
        cleanup(filePath, speechSynthesizer)
        resolve(null)
    }
}

function cleanup(filePath: string, speechSynthesizer: SpeechSynthesizer) {
    speechSynthesizer.close()
    clearTemporaryFile(filePath)
}

function clearTemporaryFile(temporaryFilePath: string) {
    fs.unlink(temporaryFilePath, (err) => {})
}

function generateRandomFilePath() {
    return `audio-${uuidv1()}.mp3`
}
