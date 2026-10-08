"use client";

import Image from "next/image";

import type { ReactNode } from "react";

interface MediaFieldProps {
    title: string;
    hint: string;
    emptyText: string;
    icon: ReactNode;
    accept: string;
    src: string;
    uploading: boolean;
    disabled?: boolean;
    onFile: (file: File) => void;
    kind: "image" | "video";
}

/* Kartu media seragam untuk gambar sampul dan video.
   Hanya tampilan: pemilihan file tetap memanggil onFile
   milik halaman sehingga alur upload tidak berubah. */
export default function MediaField({
    title,
    hint,
    emptyText,
    icon,
    accept,
    src,
    uploading,
    disabled = false,
    onFile,
    kind,
}: MediaFieldProps) {
    const fileName = src ? (src.split("/").pop() || "").split("?")[0] : "";

    return (
        <div className="rounded-xl border border-dashed border-[#cfe0c9] bg-[#f9fbf8] p-4">
            <div className="mb-3 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f3dc] text-[#1f4d2e]">
                    {icon}
                </span>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1f4d2e]">
                        {title}
                    </p>

                    <p className="truncate text-xs text-[#5f6f61]">{hint}</p>
                </div>
            </div>

            <input
                type="file"
                accept={accept}
                aria-label={title}
                disabled={disabled}
                onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    onFile(file);
                }}
                className="block w-full cursor-pointer text-sm text-[#425445] disabled:cursor-not-allowed disabled:opacity-50 disabled:file:cursor-not-allowed file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#e8f3dc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1f4d2e] hover:file:bg-[#dff0d2]"
            />

            {uploading && (
                <p
                    role="status"
                    className="mt-2 text-xs font-semibold text-[#5f6f61]"
                >
                    Uploading...
                </p>
            )}

            {src ? (
                kind === "image" ? (
                    <div className="relative mt-3 aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-[#dce6dc] bg-[#eef2ea]">
                        <Image
                            src={src}
                            alt={title}
                            fill
                            sizes="384px"
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="mt-3 aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-[#dce6dc] bg-black">
                        <video
                            controls
                            src={src}
                            className="h-full w-full object-contain"
                        />
                    </div>
                )
            ) : (
                <div className="mt-3 flex h-24 w-full max-w-sm items-center justify-center gap-2 rounded-xl border border-dashed border-[#dce6dc] bg-white px-3 text-center text-xs text-[#9aa89c]">
                    {icon}

                    <span>{emptyText}</span>
                </div>
            )}

            {fileName && (
                <p className="mt-2 truncate text-xs text-[#7d8b80]">
                    {fileName}
                </p>
            )}
        </div>
    );
}
