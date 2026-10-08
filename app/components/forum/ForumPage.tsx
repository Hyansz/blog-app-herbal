"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LoginModal from "@/app/components/LoginModal";
import RegisterModal from "@/app/components/RegisterModal";
import LoadingButton from "@/app/components/LoadingButton";
import DashboardHeader from "@/app/components/DashboardHeader";
import ConfirmModal from "@/app/components/ConfirmModal";
import { validateProfanity } from "@/lib/profanity";
import ProfanityModal from "@/app/components/ProfanityModal";
import { formatRelativeTime } from "@/lib/time";
import {
    FiMessageCircle,
    FiMoreHorizontal,
    FiSend,
    FiEdit2,
    FiTrash2,
    FiInfo,
} from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface Props {
    user?: {
        id: string;
        name: string;
        role: string;
    } | null;
}

interface ForumAuthor {
    id: string;
    name: string;
    role: string;
}

interface ForumComment {
    id: string;
    content: string;
    createdAt: string;
    authorId: string;
    author: ForumAuthor;
}

/* Bentuk respon GET /api/forum. */
interface ApiPost {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    author: ForumAuthor;
    comments: ForumComment[];
    likes: { id: string }[];
    likedByMe?: boolean;
}

type ForumPost = ApiPost & {
    likedByMe: boolean;
    likeCount: number;
};

interface Notice {
    text: string;
    needLogin?: boolean;
}

const NETWORK_ERROR =
    "Tidak bisa terhubung ke server. Periksa koneksi internetmu lalu coba lagi.";

const RULES = [
    "Gunakan bahasa yang sopan dan saling menghargai.",
    "Batasi diskusi pada topik herbal, kesehatan, dan pengobatan alami.",
    "Jangan menyebarkan informasi medis yang belum tentu benar.",
    "Hormati pengalaman dan pendapat anggota lain.",
];

function normalizePosts(data: ApiPost[]): ForumPost[] {
    if (!Array.isArray(data)) return [];

    return data.map((post) => ({
        ...post,
        comments: post.comments ?? [],
        likes: post.likes ?? [],
        likedByMe: !!post.likedByMe,
        likeCount: (post.likes ?? []).length,
    }));
}

/* Pesan yang tampil ke pemakai: pesan server dipakai apa adanya
   selama masih manusiawi, selain itu diganti kalimat ramah. */
function friendlyMessage(
    status: number,
    message: string | null,
    fallback: string,
): string {
    if (status === 401) {
        return "Sesi kamu sudah berakhir. Silakan masuk kembali untuk melanjutkan.";
    }

    if (message && message !== "Server error" && message !== "Unauthorized") {
        return message;
    }

    if (status >= 500) {
        return "Terjadi gangguan di server. Coba lagi beberapa saat lagi.";
    }

    return fallback;
}

export default function ForumPage({ user }: Props) {
    const isLoggedIn = !!user;
    const isAdmin = user?.role === "ADMIN";

    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const [content, setContent] = useState("");
    const [posting, setPosting] = useState(false);

    const [commentInputs, setCommentInputs] = useState<
        Record<string, string>
    >({});
    const [commentingId, setCommentingId] = useState<string | null>(null);

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const [profanityModal, setProfanityModal] = useState({
        open: false,
        message: "",
    });

    const [notice, setNotice] = useState<Notice | null>(null);

    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteCommentId, setDeleteCommentId] = useState<string | null>(
        null,
    );
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
        null,
    );

    const [editTarget, setEditTarget] = useState<{
        kind: "post" | "comment";
        id: string;
        content: string;
    } | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    const [poppedId, setPoppedId] = useState<string | null>(null);

    /* Penjaga race like: hanya satu request per postingan yang
       boleh berjalan, tanpa perubahan tampilan. */
    const likeInFlight = useRef<Set<string>>(new Set());
    const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const composerRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        return () => {
            if (popTimer.current) clearTimeout(popTimer.current);
        };
    }, []);

    function canManage(authorId?: string) {
        if (!user) return false;

        return isAdmin || authorId === user.id;
    }

    function showNetworkError() {
        setNotice({ text: NETWORK_ERROR });
    }

    async function showResponseError(res: Response, fallback: string) {
        let message: string | null = null;

        try {
            const data = await res.json();
            message = data?.message ?? null;
        } catch {
            /* body bukan JSON -> pakai fallback */
        }

        if (res.status === 401) {
            setNotice({
                text: "Sesi kamu sudah berakhir. Silakan masuk kembali untuk melanjutkan.",
                needLogin: true,
            });

            return;
        }

        setNotice({
            text: friendlyMessage(res.status, message, fallback),
        });
    }

    async function loadPosts() {
        try {
            const res = await fetch("/api/forum", {
                cache: "no-store",
            });

            if (!res.ok) {
                await showResponseError(res, "Gagal memuat diskusi.");
                return;
            }

            const data = await res.json();

            setPosts(normalizePosts(data));
        } catch {
            showNetworkError();
        } finally {
            setLoadingPosts(false);
        }
    }

    useEffect(() => {
        loadPosts();
    }, []);

    const totalComments = useMemo(() => {
        return posts.reduce(
            (acc, item) => acc + item.comments.length,
            0,
        );
    }, [posts]);

    function focusComposer() {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        composerRef.current?.focus();
        composerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }

    function pop(postId: string) {
        setPoppedId(postId);

        if (popTimer.current) clearTimeout(popTimer.current);

        popTimer.current = setTimeout(() => setPoppedId(null), 200);
    }

    /* ---------- POSTINGAN ---------- */

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (posting) return;

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
                    check.message ?? "Konten mengandung kata tidak pantas.",
            });

            return;
        }

        setPosting(true);
        setNotice(null);

        try {
            const res = await fetch("/api/forum", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            });

            if (!res.ok) {
                await showResponseError(res, "Diskusi gagal diposting.");
                return;
            }

            setContent("");

            if (composerRef.current) composerRef.current.style.height = "";

            await loadPosts();
        } catch {
            showNetworkError();
        } finally {
            setPosting(false);
        }
    }

    async function handleLike(postId: string) {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        if (likeInFlight.current.has(postId)) return;

        const previous = posts.find((p) => p.id === postId);

        if (!previous) return;

        const target = !previous.likedByMe;

        likeInFlight.current.add(postId);

        /* Optimistic: UI berubah dulu, request menyusul. */
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? {
                          ...p,
                          likedByMe: target,
                          likeCount: Math.max(
                              0,
                              p.likeCount + (target ? 1 : -1),
                          ),
                      }
                    : p,
            ),
        );

        if (target) pop(postId);

        try {
            const res = await fetch(`/api/forum/${postId}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ liked: target }),
            });

            if (!res.ok) {
                setPosts((prev) =>
                    prev.map((p) => (p.id === postId ? previous : p)),
                );

                await showResponseError(res, "Gagal memperbarui suka.");
                return;
            }

            const data = await res.json();

            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                              ...p,
                              likedByMe: !!data.liked,
                              likeCount:
                                  typeof data.likeCount === "number"
                                      ? data.likeCount
                                      : p.likeCount,
                          }
                        : p,
                ),
            );
        } catch {
            setPosts((prev) =>
                prev.map((p) => (p.id === postId ? previous : p)),
            );

            showNetworkError();
        } finally {
            likeInFlight.current.delete(postId);
        }
    }

    async function handleComment(postId: string) {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        if (commentingId) return;

        const value = commentInputs[postId] ?? "";

        if (!value.trim()) return;

        const check = validateProfanity(value);

        if (!check.ok) {
            setProfanityModal({
                open: true,
                message:
                    check.message ?? "Konten mengandung kata tidak pantas.",
            });

            return;
        }

        setCommentingId(postId);
        setNotice(null);

        try {
            const res = await fetch(`/api/forum/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: value }),
            });

            if (!res.ok) {
                await showResponseError(res, "Komentar gagal dikirim.");
                return;
            }

            setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

            await loadPosts();
        } catch {
            showNetworkError();
        } finally {
            setCommentingId(null);
        }
    }

    async function handleDelete(postId: string) {
        if (deletingId) return;

        setDeletingId(postId);
        setDropdownOpen(null);

        try {
            const res = await fetch(`/api/forum/${postId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                await showResponseError(res, "Diskusi gagal dihapus.");
                return;
            }

            setPosts((prev) => prev.filter((p) => p.id !== postId));
            setDeleteModal(null);
        } catch {
            showNetworkError();
        } finally {
            setDeletingId(null);
        }
    }

    async function handleDeleteComment(commentId: string) {
        if (deletingCommentId) return;

        setDeletingCommentId(commentId);

        try {
            const res = await fetch(`/api/forum/comment/${commentId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                await showResponseError(res, "Komentar gagal dihapus.");
                return;
            }

            setPosts((prev) =>
                prev.map((p) => ({
                    ...p,
                    comments: p.comments.filter(
                        (c) => c.id !== commentId,
                    ),
                })),
            );

            setDeleteCommentId(null);
        } catch {
            showNetworkError();
        } finally {
            setDeletingCommentId(null);
        }
    }

    function openEditPost(post: ApiPost) {
        setDropdownOpen(null);

        setEditTarget({
            kind: "post",
            id: post.id,
            content: post.content,
        });
    }

    function openEditComment(comment: ForumComment) {
        setEditTarget({
            kind: "comment",
            id: comment.id,
            content: comment.content,
        });
    }

    async function handleSaveEdit() {
        if (!editTarget || savingId) return;

        const nextContent = editTarget.content;

        if (!nextContent.trim()) return;

        const check = validateProfanity(nextContent);

        if (!check.ok) {
            setProfanityModal({
                open: true,
                message:
                    check.message ?? "Konten mengandung kata tidak pantas.",
            });

            return;
        }

        setSavingId(editTarget.id);

        const isPost = editTarget.kind === "post";

        try {
            const res = await fetch(
                isPost
                    ? `/api/forum/${editTarget.id}`
                    : `/api/forum/comment/${editTarget.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: nextContent }),
                },
            );

            if (!res.ok) {
                await showResponseError(
                    res,
                    "Gagal menyimpan perubahan.",
                );
                return;
            }

            if (isPost) {
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === editTarget.id
                            ? { ...p, content: nextContent }
                            : p,
                    ),
                );
            } else {
                setPosts((prev) =>
                    prev.map((p) => ({
                        ...p,
                        comments: p.comments.map((c) =>
                            c.id === editTarget.id
                                ? { ...c, content: nextContent }
                                : c,
                        ),
                    })),
                );
            }

            setEditTarget(null);
        } catch {
            showNetworkError();
        } finally {
            setSavingId(null);
        }
    }

    function autoGrow(e: React.SyntheticEvent<HTMLTextAreaElement>) {
        const el = e.currentTarget;

        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }

    return (
        <>
            {/* HEADER RINGKAS */}
            <div className="mb-8">
                <DashboardHeader
                    eyebrow="Forum Komunitas"
                    title="Forum Diskusi"
                    description="Tempat berbagi pengalaman, tips, dan pertanyaan seputar herbal bersama komunitas."
                >
                    <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white">
                        {posts.length} Diskusi
                    </span>

                    <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white">
                        {totalComments} Komentar
                    </span>
                </DashboardHeader>
            </div>

            {/* PESAN INLINE */}
            {notice && (
                <div
                    role="alert"
                    className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#f0d9a6] bg-[#fdf7e7] px-4 py-3 text-sm text-[#7a5b16]"
                >
                    <span className="min-w-0 flex-1 break-words">
                        {notice.text}
                    </span>

                    {notice.needLogin && (
                        <button
                            type="button"
                            onClick={() => {
                                setNotice(null);
                                setShowLoginModal(true);
                            }}
                            className="h-9 shrink-0 rounded-xl bg-[#1f4d2e] px-4 text-sm font-bold text-white transition hover:bg-[#17351f]"
                        >
                            Masuk lagi
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        aria-label="Tutup pesan"
                        className="h-9 shrink-0 rounded-xl border border-[#e6d5a8] bg-white px-3 text-sm font-semibold transition hover:bg-[#fdf7e7]"
                    >
                        Tutup
                    </button>
                </div>
            )}

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 xl:flex-row xl:items-start">
                {/* FEED */}
                <div className="mx-auto w-full max-w-3xl space-y-4 xl:mx-0 xl:flex-1">
                    {/* CTA TAMU */}
                    {!isLoggedIn && (
                        <div className="flex flex-col gap-4 rounded-2xl border border-[#dce6dc] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-base font-extrabold text-[#1f4d2e]">
                                    Masuk untuk ikut berdiskusi
                                </p>

                                <p className="mt-1 text-sm leading-relaxed text-[#5f6f61]">
                                    Buat postingan, beri komentar, dan sukai
                                    diskusi yang kamu suka.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowLoginModal(true)}
                                className="h-11 shrink-0 rounded-xl bg-[#1f4d2e] px-6 text-sm font-bold text-white transition hover:bg-[#17351f]"
                            >
                                Login
                            </button>
                        </div>
                    )}

                    {/* COMPOSER */}
                    {isLoggedIn && (
                        <section className="rounded-2xl border border-[#e4ebe1] bg-white p-4 shadow-sm sm:p-5">
                            <form onSubmit={handleSubmit}>
                                <div className="flex gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#17351f] to-[#7dbb43] text-sm font-black text-white">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <textarea
                                        ref={composerRef}
                                        value={content}
                                        onChange={(e) =>
                                            setContent(e.target.value)
                                        }
                                        onInput={autoGrow}
                                        rows={3}
                                        placeholder="Bagikan pengalaman, pertanyaan, atau informasi herbal..."
                                        className="min-h-[84px] max-h-[200px] w-full resize-none rounded-2xl border border-[#dce6dc] bg-[#f7faf4] px-4 py-3 text-base leading-relaxed text-[#17351f] outline-none transition focus:border-[#7dbb43] focus:bg-white"
                                    />
                                </div>

                                <div className="mt-3 flex justify-end">
                                    <LoadingButton
                                        type="submit"
                                        loading={posting}
                                        loadingText="Mengirim..."
                                        className="rounded-xl bg-[#1f4d2e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#17351f]"
                                    >
                                        Posting
                                    </LoadingButton>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* SKELETON */}
                    {loadingPosts && (
                        <div className="space-y-4">
                            {[0, 1].map((n) => (
                                <div
                                    key={n}
                                    className="animate-pulse rounded-2xl border border-[#e4ebe1] bg-white p-5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-[#eef2ea]" />

                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-32 rounded bg-[#eef2ea]" />
                                            <div className="h-3 w-20 rounded bg-[#eef2ea]" />
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="h-3 w-full rounded bg-[#eef2ea]" />
                                        <div className="h-3 w-4/5 rounded bg-[#eef2ea]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* POSTINGAN */}
                    {!loadingPosts &&
                        posts.map((post) => {
                            const isOpen =
                                expanded[post.id] ||
                                post.comments.length === 0;

                            return (
                                <article
                                    key={post.id}
                                    className="overflow-hidden rounded-2xl border border-l-2 border-[#e4ebe1] border-l-[#7dbb43] bg-white shadow-[0_6px_24px_rgba(16,40,23,0.06)] transition hover:shadow-[0_10px_30px_rgba(16,40,23,0.1)]"
                                >
                                    {/* HEADER */}
                                    <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#17351f] to-[#7dbb43] text-sm font-black text-white">
                                                {post.author.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="truncate text-[15px] font-bold text-[#17351f]">
                                                        {post.author.name}
                                                    </span>

                                                    {post.author.role ===
                                                        "ADMIN" && (
                                                        <span className="rounded-full bg-[#1f4d2e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                                            ADMIN
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-0.5 text-xs text-[#708172]">
                                                    {formatRelativeTime(
                                                        post.createdAt,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {canManage(post.authorId) && (
                                            <div className="relative shrink-0">
                                                <button
                                                    type="button"
                                                    aria-label="Menu postingan"
                                                    aria-expanded={
                                                        dropdownOpen ===
                                                        post.id
                                                    }
                                                    onClick={() =>
                                                        setDropdownOpen(
                                                            dropdownOpen ===
                                                                post.id
                                                                ? null
                                                                : post.id,
                                                        )
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7faf4] transition hover:bg-[#eef6ec]"
                                                >
                                                    <FiMoreHorizontal className="text-[#5f6f61]" />
                                                </button>

                                                {dropdownOpen ===
                                                    post.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() =>
                                                                setDropdownOpen(
                                                                    null,
                                                                )
                                                            }
                                                        />

                                                        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#e4ebe1] bg-white shadow-xl">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditPost(
                                                                        post,
                                                                    )
                                                                }
                                                                className="flex h-11 w-full items-center gap-2 px-4 text-left text-sm font-semibold text-[#1f4d2e] transition hover:bg-[#f7faf4]"
                                                            >
                                                                <FiEdit2 />
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setDropdownOpen(
                                                                        null,
                                                                    );
                                                                    setDeleteModal(
                                                                        post.id,
                                                                    );
                                                                }}
                                                                className="flex h-11 w-full items-center gap-2 px-4 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                                            >
                                                                <FiTrash2 />
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* ISI */}
                                    <div className="px-4 pb-3 pt-3 sm:px-5">
                                        <p className="break-words whitespace-pre-line text-[15px] leading-[1.75] text-[#33443a]">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* AKSI */}
                                    <div className="flex items-center gap-2 border-t border-[#edf2eb] px-3 py-2 sm:px-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleLike(post.id)
                                            }
                                            aria-pressed={post.likedByMe}
                                            aria-label={
                                                post.likedByMe
                                                    ? "Batal menyukai diskusi"
                                                    : "Sukai diskusi"
                                            }
                                            className="group flex h-10 items-center gap-2 rounded-xl px-3 transition hover:bg-[#f7faf4]"
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f7f1] transition-colors duration-150 group-hover:bg-[#e9f4e3]">
                                                {post.likedByMe ? (
                                                    <FaHeart
                                                        className={`text-[18px] text-red-500 transition-transform duration-150 ${
                                                            poppedId ===
                                                            post.id
                                                                ? "scale-125"
                                                                : "scale-100"
                                                        }`}
                                                    />
                                                ) : (
                                                    <FaRegHeart className="text-[18px] text-[#1f4d2e]" />
                                                )}
                                            </span>

                                            <span
                                                className={`min-w-[2ch] text-left text-sm font-black tabular-nums transition-colors duration-150 ${
                                                    post.likedByMe
                                                        ? "text-red-500"
                                                        : "text-[#17351f]"
                                                }`}
                                            >
                                                {post.likeCount}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpanded((prev) => ({
                                                    ...prev,
                                                    [post.id]: !isOpen,
                                                }))
                                            }
                                            aria-expanded={isOpen}
                                            className="group flex h-10 items-center gap-2 rounded-xl px-3 transition hover:bg-[#f7faf4]"
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f7f1] transition-colors duration-150 group-hover:bg-[#e9f4e3]">
                                                <FiMessageCircle className="text-[18px] text-[#1f4d2e]" />
                                            </span>

                                            <span className="min-w-[2ch] text-left text-sm font-black tabular-nums text-[#17351f]">
                                                {post.comments.length}
                                            </span>
                                        </button>
                                    </div>

                                    {/* KOMENTAR */}
                                    <div className="border-t border-[#edf2eb] bg-[#fbfcfa] px-4 py-4 sm:px-5">
                                        {post.comments.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpanded((prev) => ({
                                                        ...prev,
                                                        [post.id]: !isOpen,
                                                    }))
                                                }
                                                className="mb-3 flex h-10 items-center rounded-xl px-3 text-sm font-bold text-[#1f4d2e] transition hover:bg-[#f0f5ec]"
                                            >
                                                {isOpen
                                                    ? "Sembunyikan komentar"
                                                    : `Lihat ${post.comments.length} komentar`}
                                            </button>
                                        )}

                                        {isOpen && (
                                            <>
                                                <div className="space-y-3">
                                                    {post.comments.map(
                                                        (comment) => (
                                                            <div
                                                                key={
                                                                    comment.id
                                                                }
                                                                className="rounded-xl border border-[#e7efe4] bg-white p-3"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#17351f] to-[#7dbb43] text-xs font-black text-white">
                                                                        {comment.author.name
                                                                            ?.charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="truncate text-sm font-bold text-[#17351f]">
                                                                                {
                                                                                    comment
                                                                                        .author
                                                                                        .name
                                                                                }
                                                                            </span>

                                                                            {comment
                                                                                .author
                                                                                .role ===
                                                                                "ADMIN" && (
                                                                                <span className="rounded-full bg-[#1f4d2e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                                                                    ADMIN
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <p className="mt-0.5 text-[11px] text-[#708172]">
                                                                            {formatRelativeTime(
                                                                                comment.createdAt,
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    {canManage(
                                                                        comment.authorId,
                                                                    ) && (
                                                                        <div className="flex shrink-0 gap-1">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openEditComment(
                                                                                        comment,
                                                                                    )
                                                                                }
                                                                                className="flex h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-[#1f4d2e] transition hover:bg-[#f7faf4]"
                                                                            >
                                                                                Edit
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setDeleteCommentId(
                                                                                        comment.id,
                                                                                    )
                                                                                }
                                                                                className="flex h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                                            >
                                                                                Hapus
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-[1.7] text-[#33443a]">
                                                                    {
                                                                        comment.content
                                                                    }
                                                                </p>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                {/* INPUT / AJAKAN LOGIN */}
                                                {isLoggedIn ? (
                                                    <div className="mt-3 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={
                                                                commentInputs[
                                                                    post.id
                                                                ] ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                setCommentInputs(
                                                                    (
                                                                        prev,
                                                                    ) => ({
                                                                        ...prev,
                                                                        [post.id]:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                )
                                                            }
                                                            onKeyDown={(
                                                                e,
                                                            ) => {
                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                ) {
                                                                    e.preventDefault();
                                                                    handleComment(
                                                                        post.id,
                                                                    );
                                                                }
                                                            }}
                                                            placeholder="Tulis komentar..."
                                                            aria-label="Tulis komentar"
                                                            className="h-11 min-w-0 flex-1 rounded-xl border border-[#dce6dc] bg-white px-4 text-base outline-none transition focus:border-[#7dbb43]"
                                                        />

                                                        <LoadingButton
                                                            onClick={() =>
                                                                handleComment(
                                                                    post.id,
                                                                )
                                                            }
                                                            loading={
                                                                commentingId ===
                                                                post.id
                                                            }
                                                            loadingText=""
                                                            aria-label="Kirim komentar"
                                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1f4d2e] text-white transition hover:bg-[#17351f]"
                                                        >
                                                            <FiSend />
                                                        </LoadingButton>
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[#dce6dc] bg-white px-4 py-3">
                                                        <span className="min-w-0 flex-1 text-sm text-[#5f6f61]">
                                                            Masuk untuk ikut
                                                            berkomentar.
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowLoginModal(
                                                                    true,
                                                                )
                                                            }
                                                            className="h-10 shrink-0 rounded-xl bg-[#1f4d2e] px-4 text-sm font-bold text-white transition hover:bg-[#17351f]"
                                                        >
                                                            Login
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </article>
                            );
                        })}

                    {/* KOSONG */}
                    {!loadingPosts && posts.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#dce6dc] bg-white px-6 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6ec]">
                                <FiMessageCircle className="text-2xl text-[#1f4d2e]" />
                            </div>

                            <h3 className="mt-4 text-lg font-extrabold text-[#1f4d2e]">
                                Belum ada diskusi
                            </h3>

                            <p className="mt-2 text-sm text-[#6f7d72]">
                                Jadilah yang pertama berbagi pengalaman dan
                                bertanya seputar herbal.
                            </p>

                            <button
                                type="button"
                                onClick={focusComposer}
                                className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#1f4d2e] px-6 text-sm font-bold text-white transition hover:bg-[#17351f]"
                            >
                                Mulai diskusi pertama
                            </button>
                        </div>
                    )}
                </div>

                {/* ATURAN FORUM (hanya xl ke atas) */}
                <aside className="hidden w-72 shrink-0 xl:block">
                    <div className="rounded-2xl border border-[#dce6dc] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <FiInfo className="text-[#7dbb43]" />

                            <h2 className="text-base font-extrabold text-[#1f4d2e]">
                                Aturan Forum
                            </h2>
                        </div>

                        <ol className="mt-4 space-y-3">
                            {RULES.map((rule, index) => (
                                <li
                                    key={rule}
                                    className="flex gap-3 text-sm leading-relaxed text-[#5f6f61]"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef6ec] text-[11px] font-black text-[#1f4d2e]">
                                        {index + 1}
                                    </span>

                                    {rule}
                                </li>
                            ))}
                        </ol>
                    </div>
                </aside>
            </div>

            {/* MODAL HAPUS POSTINGAN */}
            <ConfirmModal
                open={Boolean(deleteModal)}
                title="Hapus diskusi?"
                description={
                    <>
                        Diskusi ini beserta seluruh komentar dan sukanya akan
                        dihapus permanen. Tindakan ini tidak bisa dibatalkan.
                    </>
                }
                confirmText="Hapus"
                loadingText="Menghapus..."
                loading={deletingId === deleteModal}
                danger
                onConfirm={() => {
                    if (deleteModal) handleDelete(deleteModal);
                }}
                onCancel={() => setDeleteModal(null)}
            />

            {/* MODAL HAPUS KOMENTAR */}
            <ConfirmModal
                open={Boolean(deleteCommentId)}
                title="Hapus komentar?"
                description="Komentar ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
                confirmText="Hapus"
                loadingText="Menghapus..."
                loading={deletingCommentId === deleteCommentId}
                danger
                onConfirm={() => {
                    if (deleteCommentId)
                        handleDeleteComment(deleteCommentId);
                }}
                onCancel={() => setDeleteCommentId(null)}
            />

            {/* MODAL EDIT */}
            {editTarget && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md sm:p-5">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#e4ebe1] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
                    >
                        <div className="bg-gradient-to-r from-[#17351f] to-[#245434] px-7 py-6">
                            <h3 className="text-xl font-black text-white">
                                {editTarget.kind === "post"
                                    ? "Edit Diskusi"
                                    : "Edit Komentar"}
                            </h3>
                        </div>

                        <div className="px-7 py-6">
                            <textarea
                                value={editTarget.content}
                                onChange={(e) =>
                                    setEditTarget({
                                        ...editTarget,
                                        content: e.target.value,
                                    })
                                }
                                rows={5}
                                className="w-full resize-none rounded-2xl border border-[#dce6dc] px-5 py-4 text-[15px] leading-relaxed outline-none transition focus:border-[#7dbb43]"
                            />

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEditTarget(null)}
                                    disabled={savingId === editTarget.id}
                                    className="w-full flex-1 rounded-2xl border border-[#dce6dc] bg-white py-3 font-semibold text-[#17351f] transition hover:bg-[#f7faf4] disabled:opacity-50 sm:w-auto"
                                >
                                    Batal
                                </button>

                                <LoadingButton
                                    onClick={handleSaveEdit}
                                    loading={savingId === editTarget.id}
                                    loadingText="Menyimpan..."
                                    className="w-full flex-1 rounded-2xl bg-[#1f4d2e] py-3 font-semibold text-white transition hover:bg-[#17351f] sm:w-auto"
                                >
                                    Simpan
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LOGIN */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-5 backdrop-blur-md">
                    <LoginModal
                        onClose={() => setShowLoginModal(false)}
                        onOpenRegister={() => {
                            setShowLoginModal(false);
                            setShowRegisterModal(true);
                        }}
                    />
                </div>
            )}

            {/* REGISTER */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-5 backdrop-blur-md">
                    <RegisterModal
                        onClose={() => setShowRegisterModal(false)}
                        onOpenLogin={() => {
                            setShowRegisterModal(false);
                            setShowLoginModal(true);
                        }}
                    />
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
