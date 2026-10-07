import sanitizeHtml from "sanitize-html";

/* ============================================================
   Helper konten artikel — dipakai HANYA di server.

   Konten yang dikirim client (HTML dari Tiptap) tidak pernah
   disimpan apa adanya. Selalu lewat sanitasi allowlist ini
   sebelum masuk database.
   ============================================================ */

/* Tag yang boleh ada di konten artikel. */
const ALLOWED_TAGS = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "hr",
    "img",
    "span",
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: ALLOWED_TAGS,

    allowedAttributes: {
        a: ["href", "target", "rel"],
        img: ["src", "alt"],
        /* style hanya diperbolehkan di sini, isinya sendiri
           dibatasi allowedStyles di bawah. */
        "*": ["style"],
    },

    /* Hanya properti text-align yang boleh bertahan, dengan
       nilai yang valid. Properti lain dibuang. */
    allowedStyles: {
        "*": {
            "text-align": [
                /^left$/,
                /^right$/,
                /^center$/,
                /^justify$/,
                /^start$/,
                /^end$/,
            ],
        },
    },

    /* href: http/https/mailto. src gambar: https saja. */
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
        img: ["https"],
    },
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,

    /* Tag berikut dibuang BESERTA isinya. */
    nonTextTags: [
        "script",
        "style",
        "textarea",
        "option",
        "noscript",
        "iframe",
        "object",
        "embed",
    ],

    disallowedTagsMode: "discard",

    /* Semua link keluar dibuka tab baru dengan rel aman. */
    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: {
                ...attribs,
                target: "_blank",
                rel: "noopener noreferrer",
            },
        }),
    },
};

/* Sanitasi HTML konten artikel. */
export function sanitizeContent(html: string): string {
    return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/* Buang semua tag -> teks polos untuk cek profanity
   dan pembuatan description. */
export function htmlToPlainText(html: string): string {
    /* Sisipkan pemisah di batas blok agar teks dua paragraf
       tidak menempel ("Satu.Dua" / "Judulabq"). */
    const withSeparators = html
        .replace(/<br\s*\/?\s*>/gi, " ")
        .replace(/<hr\s*\/?\s*>/gi, " ")
        .replace(
            /<\/(p|h[1-6]|li|blockquote|ul|ol|div|tr|table)>/gi,
            "$& ",
        );

    const stripped = sanitizeHtml(withSeparators, {
        allowedTags: [],
        allowedAttributes: {},
        allowedSchemes: [],
        nonTextTags: SANITIZE_OPTIONS.nonTextTags,
        disallowedTagsMode: "discard",
    });

    /* sanitize-html meng-escape kembali teksnya, jadi balikkan
       ke karakter aslinya dalam SATU pass agar tidak dobel decode. */
    return stripped
        .replace(
            /&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;|&nbsp;/gi,
            (entity) => {
                switch (entity.toLowerCase()) {
                    case "&amp;":
                        return "&";
                    case "&lt;":
                        return "<";
                    case "&gt;":
                        return ">";
                    case "&quot;":
                        return '"';
                    case "&nbsp;":
                        return " ";
                    default:
                        return "'";
                }
            },
        )
        .replace(/\s+/g, " ")
        .trim();
}

/* Description diambil dari 160 karakter pertama teks polos,
   dipotong di batas kata supaya tidak setengah kata. */
export function deriveDescription(
    plainText: string,
    maxLength = 160,
): string {
    const text = plainText.trim();

    if (text.length <= maxLength) {
        return text;
    }

    const cut = text.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");

    if (lastSpace <= 0) {
        return cut.trim();
    }

    return cut.slice(0, lastSpace).trim();
}
