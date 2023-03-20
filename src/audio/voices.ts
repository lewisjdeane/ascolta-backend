import { random } from "../helper"

// https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=tts
export class Language {
    code: string
    readable: string
    maleVoices: string[]
    femaleVoices: string[]

    constructor(
        code: string,
        readable: string,
        maleVoices: string[],
        femaleVoices: string[]
    ) {
        this.code = code
        this.readable = readable
        this.maleVoices = maleVoices
        this.femaleVoices = femaleVoices
    }

    getRandomVoiceForGender(gender: string): string {
        if (gender.toLowerCase() == "male") {
            return this.getRandomMaleVoice()
        } else if (gender.toLowerCase() == "female") {
            return this.getRandomFemaleVoice()
        } else {
            throw new Error(`Unexpected gender: ${gender}`)
        }
    }

    getRandomMaleVoice(): string {
        return random(this.maleVoices)
    }

    getRandomFemaleVoice(): string {
        return random(this.femaleVoices)
    }
}

export const Italian = new Language(
    "it",
    "Italian",
    [
        // Male voices.
        "it-IT-BenignoNeural",
        "it-IT-CalimeroNeural",
        "it-IT-CataldoNeural",
        "it-IT-DiegoNeural",
        "it-IT-GianniNeural",
        "it-IT-LisandroNeural",
        "it-IT-RinaldoNeural",
    ],
    [
        // Female voices.
        "it-IT-ElsaNeural",
        "it-IT-FabiolaNeural",
        "it-IT-FiammaNeural",
        "it-IT-ImeldaNeural",
        "it-IT-IrmaNeural",
        "it-IT-IsabellaNeural",
        "it-IT-PalmiraNeural",
        "it-IT-PierinaNeural",
    ]
)

export const SpanishSpain = new Language(
    "es-ES",
    "Spanish",
    [
        // Male voices.
        "es-ES-AlvaroNeural",
        "es-ES-ArnauNeural",
        "es-ES-DarioNeural",
        "es-ES-EliasNeural",
        "es-ES-NilNeural",
        "es-ES-SaulNeural",
        "es-ES-TeoNeural",
    ],
    [
        // Female voices.
        "es-ES-AbrilNeural",
        "es-ES-ElviraNeural",
        "es-ES-EstrellaNeural",
        "es-ES-IreneNeural",
        "es-ES-LaiaNeural",
        "es-ES-LiaNeural",
        "es-ES-TrianaNeural",
        "es-ES-VeraNeural",
    ]
)

export const German = new Language(
    "de-DE",
    "German",
    [
        // Male voices.
        "de-DE-BerndNeural",
        "de-DE-ChristophNeural",
        "de-DE-ConradNeural",
        "de-DE-KasperNeural",
        "de-DE-KillianNeural",
        "de-DE-KlausNeural",
        "de-DE-RalfNeural",
    ],
    [
        // Female voices.
        "de-DE-AmalaNeural",
        "de-DE-ElkeNeural",
        "de-DE-GiselaNeural",
        "de-DE-KatjaNeural",
        "de-DE-KlarissaNeural",
        "de-DE-LouisaNeural",
        "de-DE-MajaNeural",
        "de-DE-TanjaNeural",
    ]
)

export const PortuguesePortugal = new Language(
    "pt-PT",
    "Portuguese",
    ["pt-PT-DuarteNeural"], // Male voices.
    ["pt-PT-FernandaNeural", "pt-PT-RaquelNeural"] // Female voices.
)

export const LANGUAGES = [German, Italian, SpanishSpain, PortuguesePortugal]
