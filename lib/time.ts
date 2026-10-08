/* Helper waktu: format relatif ("3 jam lalu") dengan fallback
   tanggal berbahasa Indonesia. Dipakai komentar artikel & forum. */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatTanggalIndonesia(
    value: string | Date | null | undefined,
): string {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function formatRelativeTime(
    value: string | Date | null | undefined,
): string {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const diff = Date.now() - date.getTime();

    /* Data dari masa depan / clock skew: pakai tanggal biasa. */
    if (diff < 0) return formatTanggalIndonesia(date);

    if (diff < MINUTE) return "Baru saja";
    if (diff < HOUR) {
        const n = Math.floor(diff / MINUTE);
        return `${n} menit lalu`;
    }

    if (diff < DAY) {
        const n = Math.floor(diff / HOUR);
        return `${n} jam lalu`;
    }

    if (diff < 7 * DAY) {
        const n = Math.floor(diff / DAY);
        return `${n} hari lalu`;
    }

    return formatTanggalIndonesia(date);
}
