"use client";

import { useEffect, useState } from "react";
import ProfanityModal from "@/app/components/ProfanityModal";
import LoadingButton from "@/app/components/LoadingButton";
import LoginModal from "@/app/components/LoginModal";
import RegisterModal from "@/app/components/RegisterModal";
import { FiMessageCircle, FiSend } from "react-icons/fi";
import { validateProfanity } from "@/lib/profanity";
import { formatRelativeTime } from "@/lib/time";

interface Props {
    articleId: string;

    user?: {
        id: string;
        name: string;
        role: string;
    } | null;
}

interface CommentItem {
    id: string;
    content: string;
    createdAt: string;
    author: {
        name: string;
        role: string;
    };
}

export default function ArticleComments({ articleId, user }: Props) {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const isLoggedIn = !!user;

    const [profanityModal, setProfanityModal] = useState({
        open: false,
        message: "",
    });

    async function loadComments() {
        try {
            const res = await fetch(`/api/articles/${articleId}/comments`, {
                cache: "no-store",
            });

            const data = await res.json();

            if (Array.isArray(data)) setComments(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadComments();
    }, []);

    function closeAuthModals() {
        setShowLoginModal(false);
        setShowRegisterModal(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (loading) return;

        if (!isLoggedIn) {
            setShowLoginModal(true);

            return;
        }

        if (!content.trim()) return;

        const check = validateProfanity(content);

        if (!check.ok) {
            setProfanityModal({
                open: true,
                message:
                    check.message ?? "Komentar mengandung kata tidak pantas.",
            });

            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/articles/${articleId}/comments`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    content,
                }),
            });

            if (res.ok) {
                setContent("");

                loadComments();
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-[#dce6dc] bg-white shadow-sm">
                {/* HEADER */}
                <div className="border-b border-[#eef2ea] px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f4d2e] to-[#7dbb43] text-white">
                            <FiMessageCircle />
                        </div>

                        <h2 className="text-xl font-extrabold text-[#1f4d2e] sm:text-2xl">
                            Komentar ({comments.length})
                        </h2>
                    </div>
                </div>

                {/* FORM / CTA */}
                <div className="border-b border-[#eef2ea] bg-[#fafcf9] px-5 py-5 sm:px-6">
                    {isLoggedIn ? (
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Bagikan pendapat atau pengalamanmu tentang herbal ini..."
                                className="h-28 w-full resize-none rounded-2xl border border-[#dce6dc] bg-white px-5 py-4 text-[15px] leading-relaxed text-[#1f4d2e] outline-none transition focus:border-[#7dbb43]"
                            />

                            <div className="mt-4 flex justify-end">
                                <LoadingButton
                                    type="submit"
                                    loading={loading}
                                    loadingText="Mengirim..."
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#1f4d2e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#17351f]"
                                >
                                    <FiSend />
                                    Kirim
                                </LoadingButton>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm leading-relaxed text-[#5f6f61]">
                                Masuk untuk ikut berkomentar pada artikel ini.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowLoginModal(true)}
                                className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#1f4d2e] px-6 text-sm font-bold text-white transition hover:bg-[#17351f]"
                            >
                                Masuk untuk ikut berkomentar
                            </button>
                        </div>
                    )}
                </div>

                {/* KOMENTAR */}
                <div className="px-5 py-5 sm:px-6">
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <article
                                key={comment.id}
                                className="rounded-2xl border border-[#e7efe4] bg-[#fcfdfb] p-4 transition hover:shadow-sm sm:p-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f4d2e] to-[#7dbb43] text-sm font-black text-white">
                                        {comment.author.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="truncate text-[15px] font-bold text-[#1f4d2e]">
                                                {comment.author.name}
                                            </span>

                                            {comment.author.role ===
                                                "ADMIN" && (
                                                <span className="rounded-full bg-[#1f4d2e] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                                    ADMIN
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-0.5 text-xs text-[#6f7d72]">
                                            {formatRelativeTime(
                                                comment.createdAt,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-3 break-words whitespace-pre-wrap text-[15px] leading-[1.85] text-[#33443a]">
                                    {comment.content}
                                </p>
                            </article>
                        ))}
                    </div>

                    {comments.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#dce6dc] bg-[#fafcf9] px-6 py-12 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6ec]">
                                <FiMessageCircle className="text-2xl text-[#1f4d2e]" />
                            </div>

                            <h3 className="mt-4 text-lg font-extrabold text-[#1f4d2e]">
                                Belum ada komentar
                            </h3>

                            <p className="mt-2 text-sm text-[#6f7d72]">
                                Jadilah yang pertama berdiskusi pada artikel
                                ini.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* LOGIN */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[999]">
                    <div
                        onClick={closeAuthModals}
                        className="absolute inset-0 cursor-pointer bg-black/30 backdrop-blur-sm"
                    />

                    <div className="relative z-[1000] flex min-h-screen items-center justify-center p-6">
                        <LoginModal
                            onClose={closeAuthModals}
                            onOpenRegister={() => {
                                setShowLoginModal(false);
                                setShowRegisterModal(true);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* REGISTER */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-[999]">
                    <div
                        onClick={closeAuthModals}
                        className="absolute inset-0 cursor-pointer bg-black/30 backdrop-blur-sm"
                    />

                    <div className="relative z-[1000] flex min-h-screen items-center justify-center p-6">
                        <RegisterModal
                            onClose={closeAuthModals}
                            onOpenLogin={() => {
                                setShowRegisterModal(false);
                                setShowLoginModal(true);
                            }}
                        />
                    </div>
                </div>
            )}

            <ProfanityModal
                open={profanityModal.open}
                message={profanityModal.message}
                onClose={() =>
                    setProfanityModal({
                        open: false,
                        message: "",
                    })
                }
            />
        </>
    );
}
