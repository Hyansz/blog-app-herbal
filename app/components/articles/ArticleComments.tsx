"use client";

import { useEffect, useState } from "react";
import ProfanityModal from "@/app/components/ProfanityModal";
import { FiClock, FiMessageCircle, FiSend, FiUser } from "react-icons/fi";
import { Eye, EyeOff } from "lucide-react";
import { validateProfanity } from "@/lib/profanity";

interface Props {
    articleId: string;

    user?: {
        id: string;
        name: string;
        role: string;
    } | null;
}

export default function ArticleComments({ articleId, user }: Props) {
    const [comments, setComments] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const isLoggedIn = !!user;
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);
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

            setComments(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadComments();
    }, []);

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
                    check.message ?? "Komentar mengandung kata tidak pantas.",
            });

            return;
        }

        setLoading(true);

        const res = await fetch(`/api/articles/${articleId}/comments`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                content,
            }),
        });

        setLoading(false);

        if (res.ok) {
            setContent("");

            loadComments();
        }
    }

    return (
        <>
            <section className="mt-12 overflow-hidden rounded-[36px] border border-[#dce6dc] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                {/* HEADER */}
                <div className="border-b border-[#eef2ea] px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f4d2e] to-[#7dbb43] text-white shadow-lg">
                            <FiMessageCircle className="text-2xl" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-black text-[#1f4d2e]">
                                Komentar Artikel
                            </h2>

                            <p className="mt-1 text-sm text-[#6b7b6e]">
                                Diskusi komunitas HerbalPedia Indonesia
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div className="border-b border-[#eef2ea] bg-[#fafcf9] p-8">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={
                                isLoggedIn
                                    ? "Bagikan pendapat atau pengalamanmu tentang herbal ini..."
                                    : "Login untuk ikut berdiskusi..."
                            }
                            className="h-36 w-full resize-none rounded-[28px] border border-[#dce6dc] bg-white p-6 text-[15px] leading-relaxed text-[#1f4d2e] outline-none transition focus:border-[#7dbb43]"
                        />

                        {!isLoggedIn && (
                            <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm leading-relaxed text-yellow-700">
                                Kamu dapat membaca semua komentar tanpa login,
                                namun untuk ikut berdiskusi harus login terlebih
                                dahulu.
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#1f4d2e] to-[#2f6b3f] px-7 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.02]"
                            >
                                <FiSend />

                                {loading ? "Mengirim..." : "Kirim Komentar"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* COMMENTS */}
                <div className="p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-2xl font-black text-[#1f4d2e]">
                            Semua Komentar
                        </h3>

                        <div className="rounded-2xl bg-[#f4f7f1] px-4 py-2 text-sm font-bold text-[#1f4d2e]">
                            {comments.length} komentar
                        </div>
                    </div>

                    <div className="space-y-5">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="rounded-[28px] border border-[#e7efe4] bg-[#fcfdfb] p-6 transition hover:shadow-md"
                            >
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f4d2e] to-[#7dbb43] text-lg font-black text-white">
                                            {comment.author.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-bold text-[#1f4d2e]">
                                                    {comment.author.name}
                                                </h4>

                                                {comment.author.role ===
                                                    "ADMIN" && (
                                                    <span className="rounded-full bg-[#1f4d2e] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                                        ADMIN
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex items-center gap-2 text-sm text-[#6f7d72]">
                                                <FiClock />

                                                <span>
                                                    {new Date(
                                                        comment.createdAt,
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-[#f4f7f1] p-3">
                                        <FiUser className="text-[#5f6f61]" />
                                    </div>
                                </div>

                                <p className="whitespace-pre-wrap text-[15px] leading-[1.9] text-[#33443a]">
                                    {comment.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {comments.length === 0 && (
                        <div className="rounded-[28px] border border-dashed border-[#dce6dc] bg-[#fafcf9] px-8 py-16 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eef6ec]">
                                <FiMessageCircle className="text-3xl text-[#1f4d2e]" />
                            </div>

                            <h3 className="mt-6 text-2xl font-black text-[#1f4d2e]">
                                Belum Ada Komentar
                            </h3>

                            <p className="mt-3 text-[#6f7d72]">
                                Jadilah yang pertama berdiskusi pada artikel
                                ini.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* LOGIN / REGISTER MODAL */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-[32px] border border-[#dce6dc] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => {
                                setShowLoginModal(false);

                                setShowRegister(false);
                            }}
                            className="absolute right-5 top-5 rounded-full bg-[#f4f7f1] p-2 transition hover:bg-[#e7efe4]"
                        >
                            ✕
                        </button>

                        {/* LOGIN */}
                        {!showRegister ? (
                            <>
                                <h1 className="mb-2 text-center text-4xl font-bold text-[#1f4d2e]">
                                    Login
                                </h1>

                                <p className="mb-8 text-center text-sm text-[#6b7b6d]">
                                    Masuk untuk memberikan komentar pada artikel
                                    herbal.
                                </p>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();

                                        setLoginLoading(true);

                                        try {
                                            const res = await fetch(
                                                "/api/auth/login",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        email: loginEmail,
                                                        password: loginPassword,
                                                    }),
                                                },
                                            );

                                            const data = await res.json();

                                            if (res.ok) {
                                                localStorage.setItem(
                                                    "role",
                                                    data.user.role,
                                                );

                                                document.body.style.overflow =
                                                    "auto";

                                                setShowLoginModal(false);

                                                window.location.reload();
                                            } else {
                                                alert(
                                                    data.message ||
                                                        "Login gagal",
                                                );
                                            }
                                        } catch {
                                            alert("Terjadi kesalahan");
                                        }

                                        setLoginLoading(false);
                                    }}
                                    className="space-y-5"
                                >
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={loginEmail}
                                        onChange={(e) =>
                                            setLoginEmail(e.target.value)
                                        }
                                        className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 outline-none transition focus:border-[#7dbb43]"
                                    />

                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Password"
                                            value={loginPassword}
                                            onChange={(e) =>
                                                setLoginPassword(e.target.value)
                                            }
                                            className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 pr-14 outline-none transition focus:border-[#7dbb43]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6f61]"
                                        >
                                            {showPassword ? (
                                                <Eye size={20} />
                                            ) : (
                                                <EyeOff size={20} />
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        disabled={loginLoading}
                                        className="flex w-full items-center justify-center rounded-2xl bg-[#1f4d2e] py-4 font-semibold text-white transition hover:bg-[#17351f]"
                                    >
                                        {loginLoading ? "Loading..." : "Masuk"}
                                    </button>

                                    <div className="text-center">
                                        <p className="text-sm text-[#5f6f61]">
                                            Belum punya akun?
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowRegister(true)
                                            }
                                            className="mt-2 font-semibold text-[#2f6b3f]"
                                        >
                                            Daftar sekarang
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* REGISTER */}
                                <h1 className="mb-2 text-center text-4xl font-bold text-[#1f4d2e]">
                                    Register
                                </h1>

                                <p className="mb-8 text-center text-sm text-[#6b7b6d]">
                                    Buat akun untuk ikut berdiskusi di
                                    HerbalPedia.
                                </p>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();

                                        setRegisterLoading(true);

                                        try {
                                            const res = await fetch(
                                                "/api/auth/register",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        name: registerName,
                                                        email: registerEmail,
                                                        password:
                                                            registerPassword,
                                                    }),
                                                },
                                            );

                                            const data = await res.json();

                                            if (res.ok) {
                                                alert(
                                                    "Register berhasil, silakan login",
                                                );

                                                setShowRegister(false);

                                                setRegisterName("");
                                                setRegisterEmail("");
                                                setRegisterPassword("");
                                            } else {
                                                alert(
                                                    data.message ||
                                                        "Register gagal",
                                                );
                                            }
                                        } catch {
                                            alert("Terjadi kesalahan");
                                        }

                                        setRegisterLoading(false);
                                    }}
                                    className="space-y-5"
                                >
                                    <input
                                        type="text"
                                        placeholder="Nama"
                                        value={registerName}
                                        onChange={(e) =>
                                            setRegisterName(e.target.value)
                                        }
                                        className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 outline-none transition focus:border-[#7dbb43]"
                                    />

                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={registerEmail}
                                        onChange={(e) =>
                                            setRegisterEmail(e.target.value)
                                        }
                                        className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 outline-none transition focus:border-[#7dbb43]"
                                    />

                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Password"
                                            value={registerPassword}
                                            onChange={(e) =>
                                                setRegisterPassword(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 pr-14 outline-none transition focus:border-[#7dbb43]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6f61]"
                                        >
                                            {showPassword ? (
                                                <Eye size={20} />
                                            ) : (
                                                <EyeOff size={20} />
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        disabled={registerLoading}
                                        className="flex w-full items-center justify-center rounded-2xl bg-[#1f4d2e] py-4 font-semibold text-white transition hover:bg-[#17351f]"
                                    >
                                        {registerLoading
                                            ? "Loading..."
                                            : "Daftar"}
                                    </button>

                                    <div className="text-center">
                                        <p className="text-sm text-[#5f6f61]">
                                            Sudah punya akun?
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowRegister(false)
                                            }
                                            className="mt-2 font-semibold text-[#2f6b3f]"
                                        >
                                            Login sekarang
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
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
