import { Configuration, OpenAIApi } from "openai"
import { getCreateAvatarPromptForCharacter } from "./prompts"
import { Character } from "../types/types"
import config from "../config/config"

const configuration = new Configuration({ apiKey: config.OPEN_AI_API_KEY })
const openai = new OpenAIApi(configuration)

/**
 * Uses OpenAI's DALL-E 2 API to generate an avatar for a given character.
 * @param character The character we want to generate an avatar for - contains information about their characteristics relevant for their avatar
 * @returns URL to the generated image hosted temporarily by OpenAI.
 */
export async function generateAvatarForCharacter(
    character: Character
): Promise<string> {
    // Get the prompt to generate an avatar for the given character.
    const prompt = getCreateAvatarPromptForCharacter(character)

    // Call the API.
    const response = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "256x256",
    })

    // Return the URL where the generated image will be temporarily hosted that we'll need to save somewhere permanent later.
    return response.data.data[0].url
}
