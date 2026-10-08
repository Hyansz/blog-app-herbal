"use client";

import { useEffect, useRef } from "react";

import LoadingButton from "@/app/components/LoadingButton";

interface Props {
    open: boolean;
    title: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    loadingText?: string;
    loading?: boolean;
    error?: string | null;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    description,
    confirmText = "Hapus",
    cancelText = "Batal",
    loadingText,
    loading = false,
    error = null,
    danger = true,
    onConfirm,
    onCancel,
}: Props) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const wasOpen = useRef(false);

    useEffect(() => {
        if (open && !wasOpen.current) {
            cancelRef.current?.focus();
        }
        wasOpen.current = open;
    }, [open]);

    useEffect(() => {
        if (!open) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && !loading) {
                onCancel();
            }
        }

        document.addEventListener("keydown", onKeyDown);

        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, loading, onCancel]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md sm:p-5"
            onClick={() => {
                if (!loading) onCancel();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-busy={loading}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-[32px] border border-[#e4ebe1] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
            >
                <div className="bg-gradient-to-r from-[#17351f] to-[#245434] px-7 py-6">
                    <h3
                        id="confirm-modal-title"
                        className="text-xl font-black text-white sm:text-2xl"
                    >
                        {title}
                    </h3>
                </div>

                <div className="px-7 py-6">
                    <div
                        id="confirm-modal-description"
                        className="text-[15px] leading-relaxed text-[#33443a]"
                    >
                        {description}
                    </div>

                    {error ? (
                        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {error}
                        </p>
                    ) : null}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
                        <button
                            ref={cancelRef}
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="w-full flex-1 rounded-2xl border border-[#dce6dc] bg-white py-3 font-semibold text-[#17351f] transition hover:bg-[#f7faf4] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            {cancelText}
                        </button>

                        <LoadingButton
                            type="button"
                            onClick={onConfirm}
                            loading={loading}
                            loadingText={loadingText}
                            className={
                                danger
                                    ? "w-full flex-1 rounded-2xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 sm:w-auto"
                                    : "w-full flex-1 rounded-2xl bg-[#1f4d2e] py-3 font-semibold text-white transition hover:bg-[#17351f] sm:w-auto"
                            }
                        >
                            {confirmText}
                        </LoadingButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
