import { insertCharacter } from "../db/character-controller"
import { random } from "../helper"
import { uploadImageAtUrl } from "../storage/storage-controller"
import { Character, CharacterWithLanguageConfig } from "../types/types"
import { Language, PortuguesePortugal } from "../audio/voices"
import { generateAvatarForCharacter } from "../ai/image-generation"
import { generateCharacters } from "../ai/conversation-generation"

const NUM_CHARACTERS_TO_GENERATE: number = 5
const language = PortuguesePortugal

// Generate the given number of characters when the script is run.
generateCharacters(language, NUM_CHARACTERS_TO_GENERATE).then(
    async (characters) => finaliseCharacters(characters)
)

/**
 * Generates the remaining information for the generated characters, such as avatar and Text-to-Speech config.
 *
 * @param characters The characters to add the remaining information to.
 */
async function finaliseCharacters(characters: Character[]) {
    console.log(`Generated characters: ${JSON.stringify(characters)}`)
    const charactersWithLanguageConfig = await Promise.all(
        // For each character, do the following:
        //   1. Calculate some Text-to-Speech (TTS) config
        //   2. Add the TTS config to the character
        //   3. Generate an avatar
        //   4. Upload the avatar to Azure
        //   5. Add the avatar link to the character
        characters.map(async (character) => {
            const characterWithLanguageConfig = addTtsConfigToCharacter(
                character,
                language
            )
            const url = await generateAvatarForCharacter(character)
            const azureUrl = await uploadImageAtUrl(url)
            characterWithLanguageConfig.avatar_url = azureUrl
            return characterWithLanguageConfig
        })
    )

    // Add the characters to the database.
    charactersWithLanguageConfig.forEach(async (character) => {
        insertCharacter(character)
    })
}

/**
 * Generate some new TTS config to be associated with the user for audio clips with this user in.
 *
 * @param character The character to generate the TTS config for.
 * @param language The language that the TTS config will need to be in.
 * @returns An updated character object with the TTS config added.
 */
function addTtsConfigToCharacter(
    character: Character,
    language: Language
): CharacterWithLanguageConfig {
    const pitch = getRandomPitch()
    const speed = getRandomSpeed()
    const voice = language.getRandomVoiceForGender(character.gender)
    const characterWithLanguageConfig: CharacterWithLanguageConfig = {
        name: character.name,
        age: character.age,
        gender: character.gender,
        occupation: character.occupation,
        avatar_url: null, // Null because we'll add this in after.
        language_config: {
            language: language.code,
            pitch: pitch,
            speed: speed,
            voice: voice,
        },
    }

    return characterWithLanguageConfig
}

function getRandomPitch(): string {
    return random(["-15%", "-10%", "-5%", "0%", "+5%", "10%"])
}

function getRandomSpeed(): string {
    return random(["-15%", "-10%", "-5%", "0%", "+5%", "10%", "15%, 20%"])
}
