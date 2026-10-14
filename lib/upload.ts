/* Unggah media langsung dari browser ke Cloudinary.
   Server hanya memberi tanda tangan (POST /api/upload/sign);
   api_secret tidak pernah menyentuh client. Dipakai oleh form
   tambah/edit artikel dan editor Tiptap. */

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

interface SignResponse {
    url: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    transformation: string;
    message?: string;
}

export async function uploadToCloudinary(file: File): Promise<string> {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
        throw new Error(
            "Format file tidak didukung. Gunakan file gambar atau video.",
        );
    }

    if (file.size > (isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES)) {
        throw new Error(
            isImage
                ? "Ukuran gambar maksimal 10 MB."
                : "Ukuran video maksimal 100 MB.",
        );
    }

    const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ size: file.size }),
    });

    const sign: SignResponse | null = await signRes.json().catch(() => null);

    if (!signRes.ok || !sign?.url) {
        throw new Error(
            sign?.message || "Gagal menyiapkan unggahan. Coba lagi.",
        );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", sign.apiKey);
    formData.append("timestamp", String(sign.timestamp));
    formData.append("signature", sign.signature);
    formData.append("folder", sign.folder);
    formData.append("transformation", sign.transformation);

    let res: Response;

    try {
        res = await fetch(sign.url, {
            method: "POST",
            body: formData,
        });
    } catch {
        throw new Error(
            "Upload gagal. Periksa koneksi internet Anda lalu coba lagi.",
        );
    }

    const data: { secure_url?: string } | null = await res
        .json()
        .catch(() => null);

    if (!res.ok || !data?.secure_url) {
        throw new Error("Upload gagal. Coba lagi atau gunakan file lain.");
    }

    return data.secure_url;
}
