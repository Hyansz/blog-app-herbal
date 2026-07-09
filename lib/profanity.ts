const DICTIONARY = [
    // ANJING
    "anjing",
    "anjg",
    "anj",
    "anjir",
    "anjay",
    "anying",
    "anyink",
    "anyeng",
    "anjrot",
    "njing",
    "njir",
    "jingan",
    "jing",

    // BANGSAT
    "bangsat",
    "bgsd",
    "bgsd",
    "bgst",
    "bgst",
    "bangsad",
    "bangsad",

    // KONTOL
    "kontol",
    "kntl",
    "kontl",
    "kntol",
    "kontlo",
    "kontolll",
    "kontolnya",

    // MEMEK
    "memek",
    "mmk",
    "meki",
    "meki",
    "mek",
    "memex",

    // NGENTOT
    "ngentot",
    "entot",
    "ngntt",
    "ngntot",
    "ngtot",
    "gentot",

    // PELER
    "peler",
    "pler",
    "peler",
    "titit",
    "titid",

    // BABI
    "babi",
    "babik",
    "babii",
    "bab1",

    // TAI
    "tai",
    "taik",
    "taii",
    "tae",
    "tahi",

    // GOBLOK
    "goblok",
    "gblk",
    "goblog",
    "goblokk",
    "blok",

    // TOLOL
    "tolol",
    "tololll",
    "tol",
    "tll",

    // BEGO
    "bego",
    "begok",
    "begoo",
    "bgo",

    // IDIOT
    "idiot",
    "idiod",
    "idiottt",

    // MONYET
    "monyet",
    "monyed",

    // ASU
    "asu",
    "asuu",

    // KAMPRET
    "kampret",
    "kamvret",
    "kamprex",

    // SETAN
    "setan",
    "syetan",

    // SIALAN
    "sialan",
    "sial",
    "siaalan",

    // BODOH
    "bodoh",
    "bodo",
    "bodohh",

    // JANCOK
    "jancok",
    "jancuk",
    "jancokkk",
    "cuk",
    "cok",
    "coeg",
    "coek",

    // KIMAK
    "kimak",
    "kimakkk",

    // PEPEK
    "pepek",

    // TOLOL
    "tolol",

    // BACOT
    "bacot",
    "bacod",

    // BRENGSEK
    "brengsek",
    "brengs",

    // HINAAN
    "lonte",
    "pelacur",
    "bajingan",
    "keparat",
    "brengsek",
    "bangke",
    "anjrit",
    "kampang",
    "sundal",
    "setan",
];

const REPLACEMENTS: Record<string, string> = {
    "0": "o",
    "1": "i",
    "2": "z",
    "3": "e",
    "4": "a",
    "5": "s",
    "6": "g",
    "7": "t",
    "8": "b",
    "9": "g",
    "@": "a",
    "$": "s",
    "!": "i",
};

export function normalizeText(text: string) {
    let s = text.toLowerCase();

    Object.entries(REPLACEMENTS).forEach(([k, v]) => {
        s = s.replaceAll(k, v);
    });

    s = s.replace(/[^a-z\s]/g, "");

    s = s.replace(/(.)\1{2,}/g, "$1");

    s = s.replace(/\s+/g, " ");

    return s;
}

export function containsProfanity(text: string) {
    const normalized = normalizeText(text);

    const compact = normalized.replace(/\s/g, "");

    for (const word of DICTIONARY) {
        if (normalized.includes(word)) return true;

        if (compact.includes(word)) return true;
    }

    return false;
}

export function censorText(text: string) {
    let result = text;

    for (const word of DICTIONARY) {
        const regex = new RegExp(word, "ig");

        result = result.replace(regex, "*".repeat(word.length));
    }

    return result;
}

export function validateProfanity(text: string) {
    if (!containsProfanity(text)) {
        return {
            ok: true,
        };
    }

    return {
        ok: false,
        message:
            "Komentar mengandung kata yang tidak pantas. Mohon gunakan bahasa yang sopan.",
    };
}