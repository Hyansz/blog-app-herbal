"use client";

import { useEffect, useMemo, useState } from "react";
import LoginModal from "@/app/components/LoginModal";
import RegisterModal from "@/app/components/RegisterModal";
import { validateProfanity } from "@/lib/profanity";
import ProfanityModal from "@/app/components/ProfanityModal";
import {
    FiClock,
    FiHeart,
    FiMessageCircle,
    FiMoreHorizontal,
    FiSend,
    FiTrendingUp,
    FiUsers,
    FiLock,
    FiChevronRight,
    FiStar,
} from "react-icons/fi";

import { FaUserCircle } from "react-icons/fa";

interface Props {
    user?: {
        id: string;
        name: string;
        role: string;
    } | null;
}

export default function ForumPage({ user }: Props) {
    const isLoggedIn = !!user;
    const [posts, setPosts] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [commentInputs, setCommentInputs] = useState<{
        [key: string]: string;
    }>({});
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [profanityModal, setProfanityModal] = useState({
        open: false,
        message: "",
    });
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<string | null>(null);

    useEffect(() => {
        function handleClickOutside() {
            setDropdownOpen(null);
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    async function handleDelete(postId: string) {
        setDeleteModal(null);
        setDropdownOpen(null);
        try {
            const res = await fetch(`/api/forum/${postId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p.id !== postId));
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function loadPosts() {
        try {
            const res = await fetch("/api/forum", {
                cache: "no-store",
            });

            const data = await res.json();

            setPosts(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadPosts();
    }, []);

    const totalComments = useMemo(() => {
        return posts.reduce(
            (acc: number, item: any) => acc + item.comments.length,
            0,
        );
    }, [posts]);

    const totalLikes = useMemo(() => {
        return posts.reduce(
            (acc: number, item: any) => acc + item.likes.length,
            0,
        );
    }, [posts]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

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

        setLoading(true);

        try {
            const res = await fetch("/api/forum", {
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

                loadPosts();
            }
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    }

    async function handleLike(postId: string) {
        if (!isLoggedIn) {
            setShowLoginModal(true);

            return;
        }

        try {
            await fetch(`/api/forum/${postId}/like`, {
                method: "POST",
            });

            loadPosts();
        } catch (error) {
            console.error(error);
        }
    }

    async function handleComment(postId: string) {
        if (!isLoggedIn) {
            setShowLoginModal(true);

            return;
        }

        const value = commentInputs[postId];

        if (!value?.trim()) return;

        const check = validateProfanity(value);

        if (!check.ok) {
            setProfanityModal({
                open: true,
                message:
                    check.message ?? "Konten mengandung kata tidak pantas.",
            });

            return;
        }

        try {
            await fetch(`/api/forum/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: value,
                }),
            });

            setCommentInputs((prev) => ({
                ...prev,
                [postId]: "",
            }));

            loadPosts();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <main className="min-h-screen">
                {/* HERO */}
                <section className="relative overflow-hidden rounded-[40px] border border-[#294935] bg-gradient-to-br from-[#07110b] via-[#102817] to-[#21432c] p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] lg:p-12">
                    <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#7dbb43]/10 blur-3xl" />

                    <div className="absolute -right-24 bottom-0 h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 grid grid-cols-1 gap-10 xl:grid-cols-[1fr_420px]">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-xl">
                                <FiStar className="text-[#dff0d2]" />

                                <span className="text-sm font-semibold tracking-wide text-[#eef7e8]">
                                    Premium Herbal Community
                                </span>
                            </div>

                            <h1 className="max-w-4xl text-5xl font-black leading-[1.05] lg:text-7xl">
                                Forum Diskusi
                                <span className="block bg-gradient-to-r from-[#dff0d2] to-[#7dbb43] bg-clip-text text-transparent">
                                    Jamoe Djawa
                                </span>
                            </h1>

                            <p className="mt-7 max-w-3xl text-lg leading-[1.9] text-[#d7e5d9]">
                                Tempat komunitas herbal Indonesia berdiskusi
                                mengenai kesehatan alami, pengobatan
                                tradisional, tanaman herbal, pengalaman pribadi,
                                dan berbagai wawasan premium lainnya.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-xl">
                                    <p className="text-3xl font-black">
                                        {posts.length}
                                    </p>

                                    <p className="mt-1 text-sm text-[#dce6dc]">
                                        Diskusi Aktif
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-xl">
                                    <p className="text-3xl font-black">
                                        {totalComments}
                                    </p>

                                    <p className="mt-1 text-sm text-[#dce6dc]">
                                        Komentar
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-xl">
                                    <p className="text-3xl font-black">
                                        {totalLikes}
                                    </p>

                                    <p className="mt-1 text-sm text-[#dce6dc]">
                                        Interaksi
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SIDE CARD */}
                        <div className="rounded-[36px] border border-white/10 bg-white/10 p-7 backdrop-blur-2xl">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7dbb43] to-[#2d6a3f] shadow-xl">
                                    <FiUsers className="text-3xl text-white" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black">
                                        Komunitas Herbal
                                    </h3>

                                    <p className="mt-1 text-sm text-[#dce6dc]">
                                        Forum sosial modern & profesional.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                                    <div className="flex items-center gap-3">
                                        <FiTrendingUp className="text-xl text-[#dff0d2]" />

                                        <div>
                                            <p className="font-bold">
                                                Diskusi Trending
                                            </p>

                                            <p className="mt-1 text-sm text-[#dce6dc]">
                                                Herbal, kesehatan, dan tips
                                                alami.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                                    <div className="flex items-center gap-3">
                                        <FiMessageCircle className="text-xl text-[#dff0d2]" />

                                        <div>
                                            <p className="font-bold">
                                                Komentar Real-time
                                            </p>

                                            <p className="mt-1 text-sm text-[#dce6dc]">
                                                Diskusi cepat dan responsif.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!isLoggedIn && (
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="mt-8 flex w-full items-center justify-between rounded-3xl bg-white px-6 py-5 font-bold text-[#17351f] shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <span>Masuk ke Komunitas</span>

                                    <FiChevronRight className="text-xl" />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* CONTENT */}
                <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_370px]">
                    {/* LEFT */}
                    <div>
                        {/* CREATE */}
                        <section className="overflow-hidden rounded-[36px] border border-[#e4ebe1] bg-white shadow-[0_15px_60px_rgba(0,0,0,0.05)]">
                            <div className="border-b border-[#edf2eb] px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1f4d2e] to-[#7dbb43] text-white shadow-lg">
                                        <FaUserCircle className="text-[30px]" />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-black text-[#17351f]">
                                            Mulai Diskusi
                                        </h2>

                                        <p className="mt-1 text-sm text-[#708172]">
                                            Tulis sesuatu untuk komunitas
                                            herbal.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={
                                        isLoggedIn
                                            ? "Bagikan pengalaman, pertanyaan, atau informasi herbal..."
                                            : "Login terlebih dahulu untuk membuat postingan..."
                                    }
                                    className="h-44 w-full resize-none rounded-[32px] border border-[#dce6dc] bg-[#f7faf4] p-6 text-[15px] leading-[1.9] text-[#17351f] outline-none transition-all duration-300 focus:border-[#7dbb43] focus:bg-white"
                                />

                                {!isLoggedIn && (
                                    <div className="mt-5 flex items-start gap-3 rounded-3xl border border-yellow-200 bg-yellow-50 px-5 py-4">
                                        <FiLock className="mt-0.5 text-lg text-yellow-700" />

                                        <p className="text-sm leading-relaxed text-yellow-700">
                                            Kamu dapat membaca seluruh diskusi,
                                            namun harus login untuk membuat
                                            postingan, menyukai, dan memberi
                                            komentar.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-7 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-3xl bg-gradient-to-r from-[#17351f] to-[#245434] px-8 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        {loading
                                            ? "Mengirim..."
                                            : "Posting Diskusi"}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* POSTS */}
                        <div className="mt-8 space-y-8">
                            {posts.map((post) => (
                                <article
                                    key={post.id}
                                    className="overflow-hidden rounded-[38px] border border-[#e4ebe1] bg-white shadow-[0_15px_60px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_70px_rgba(0,0,0,0.08)]"
                                >
                                    {/* HEADER */}
                                    <div className="flex items-start justify-between border-b border-[#edf2eb] px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#17351f] to-[#7dbb43] text-xl font-black text-white shadow-xl">
                                                {post.author.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-black text-[#17351f]">
                                                    {post.author.name}
                                                </h3>

                                                <div className="mt-1 flex items-center gap-2 text-sm text-[#708172]">
                                                    <FiClock />

                                                    <span>
                                                        {new Date(
                                                            post.createdAt,
                                                        ).toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDropdownOpen(
                                                        dropdownOpen === post.id
                                                            ? null
                                                            : post.id,
                                                    );
                                                }}
                                                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7faf4] transition hover:bg-[#eef6ec]"
                                            >
                                                <FiMoreHorizontal className="text-lg text-[#5f6f61]" />
                                            </button>

                                            {dropdownOpen === post.id &&
                                                user?.role === "ADMIN" && (
                                                    <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-[#e4ebe1] bg-white shadow-2xl">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteModal(
                                                                    post.id,
                                                                );
                                                            }}
                                                            className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="px-8 py-7">
                                        <p className="whitespace-pre-wrap text-[15px] leading-[2] text-[#33443a]">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* ACTION */}
                                    <div className="flex items-center gap-6 border-t border-[#edf2eb] px-8 py-5">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className="group flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-[#f7faf4]"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f7f1] transition group-hover:bg-[#e9f4e3]">
                                                <FiHeart className="text-lg text-[#1f4d2e]" />
                                            </div>

                                            <div className="text-left">
                                                <p className="text-sm font-black text-[#17351f]">
                                                    {post.likes.length}
                                                </p>

                                                <p className="text-xs text-[#708172]">
                                                    Likes
                                                </p>
                                            </div>
                                        </button>

                                        <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f7f1]">
                                                <FiMessageCircle className="text-lg text-[#1f4d2e]" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-black text-[#17351f]">
                                                    {post.comments.length}
                                                </p>

                                                <p className="text-xs text-[#708172]">
                                                    Komentar
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COMMENTS */}
                                    <div className="border-t border-[#edf2eb] bg-[#fbfcfa] px-8 py-7">
                                        <div className="space-y-4">
                                            {post.comments.map(
                                                (comment: any) => (
                                                    <div
                                                        key={comment.id}
                                                        className="rounded-[28px] border border-[#e7efe4] bg-white p-5 shadow-sm"
                                                    >
                                                        <div className="mb-4 flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#17351f] to-[#7dbb43] text-sm font-bold text-white">
                                                                {comment.author.name
                                                                    ?.charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <h4 className="font-bold text-[#17351f]">
                                                                    {
                                                                        comment
                                                                            .author
                                                                            .name
                                                                    }
                                                                </h4>

                                                                <p className="text-xs text-[#708172]">
                                                                    {new Date(
                                                                        comment.createdAt,
                                                                    ).toLocaleString(
                                                                        "id-ID",
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <p className="text-[15px] leading-[1.9] text-[#33443a]">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {/* INPUT */}
                                        <div className="mt-6 flex gap-3">
                                            <input
                                                type="text"
                                                value={
                                                    commentInputs[post.id] || ""
                                                }
                                                onChange={(e) =>
                                                    setCommentInputs(
                                                        (prev) => ({
                                                            ...prev,
                                                            [post.id]:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                placeholder={
                                                    isLoggedIn
                                                        ? "Tulis komentar..."
                                                        : "Login untuk memberi komentar..."
                                                }
                                                className="h-14 flex-1 rounded-2xl border border-[#dce6dc] bg-white px-5 text-[15px] outline-none transition focus:border-[#7dbb43]"
                                            />

                                            <button
                                                onClick={() =>
                                                    handleComment(post.id)
                                                }
                                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#17351f] to-[#245434] text-white shadow-lg transition hover:scale-[1.03]"
                                            >
                                                <FiSend />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <aside className="space-y-7">
                        <div className="rounded-[36px] border border-[#e4ebe1] bg-white p-7 shadow-[0_15px_60px_rgba(0,0,0,0.05)]">
                            <h3 className="text-2xl font-black text-[#17351f]">
                                Tentang Forum
                            </h3>

                            <p className="mt-5 text-[15px] leading-[1.9] text-[#5f6f61]">
                                Forum sosial herbal modern untuk berbagi
                                pengalaman, tips kesehatan alami, dan diskusi
                                komunitas Indonesia.
                            </p>

                            <div className="mt-7 space-y-4">
                                <div className="rounded-3xl bg-[#f7faf4] p-5">
                                    <p className="font-bold text-[#17351f]">
                                        🌿 Herbal Tradisional
                                    </p>

                                    <p className="mt-2 text-sm text-[#708172]">
                                        Diskusi rimpang, rempah, daun herbal,
                                        dan pengobatan alami.
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-[#f7faf4] p-5">
                                    <p className="font-bold text-[#17351f]">
                                        💬 Komunitas Aktif
                                    </p>

                                    <p className="mt-2 text-sm text-[#708172]">
                                        Interaksi modern dengan tampilan premium
                                        seperti platform sosial profesional.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[36px] border border-[#294935] bg-gradient-to-br from-[#102817] to-[#21432c] p-7 text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#dff0d2]">
                                Community Access
                            </p>

                            <h3 className="mt-4 text-3xl font-black">
                                Bergabung Bersama Komunitas
                            </h3>

                            <p className="mt-5 leading-[1.9] text-[#dce6dc]">
                                Masuk untuk membuat postingan, memberikan likes,
                                dan berdiskusi dengan member lainnya.
                            </p>

                            {!isLoggedIn && (
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="mt-7 w-full rounded-3xl bg-white px-6 py-5 font-black text-[#17351f] shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    Login Sekarang
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
            </main>

            {/* LOGIN MODAL */}
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

            {/* REGISTER MODAL */}
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

            {deleteModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-5 backdrop-blur-md">
                    <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#e4ebe1] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                        <div className="bg-gradient-to-r from-[#17351f] to-[#245434] px-8 py-6">
                            <h3 className="text-2xl font-black text-white">
                                Hapus Diskusi
                            </h3>
                        </div>

                        <div className="p-8">
                            <p className="text-[15px] leading-relaxed text-[#33443a]">
                                Apakah yakin menghapus diskusi ini?
                            </p>

                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => {
                                        setDeleteModal(null);
                                        setDropdownOpen(null);
                                    }}
                                    className="flex-1 rounded-2xl border border-[#dce6dc] bg-white py-3 font-semibold text-[#17351f] transition hover:bg-[#f7faf4]"
                                >
                                    Batal
                                </button>

                                <button
                                    onClick={() => handleDelete(deleteModal)}
                                    className="flex-1 rounded-2xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
