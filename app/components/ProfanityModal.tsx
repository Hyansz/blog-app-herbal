"use client";

import { FiAlertTriangle, FiX } from "react-icons/fi";

interface Props {
    open: boolean;
    message: string;
    onClose: () => void;
}

export default function ProfanityModal({ open, message, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#16361f] to-[#275235] px-7 py-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                            <FiAlertTriangle className="text-3xl" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Pesan Ditolak</h2>

                            <p className="text-sm text-white/80">
                                Bahasa yang digunakan kurang sopan.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 rounded-xl p-2 transition hover:bg-white/10 cursor-pointer"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-7 py-6">
                    <p className="leading-7 text-[#5f6f61]">{message}</p>

                    <button
                        onClick={onClose}
                        className="mt-7 w-full rounded-2xl bg-[#1f4d2e] py-3 font-semibold text-white transition hover:opacity-90 cursor-pointer"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
}
