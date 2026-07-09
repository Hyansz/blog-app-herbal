"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

interface Props {
    onClose: () => void;
    onOpenRegister: () => void;
}

export default function LoginModal({ onClose, onOpenRegister }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleEsc);

        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("role", data.user.role);

                document.body.style.overflow = "auto";

                onClose();

                window.location.reload();

                return;
            } else {
                alert(data.message || "Login gagal");
            }
        } catch {
            alert("Terjadi kesalahan");
        }

        setLoading(false);
    }

    return (
        <div className="relative w-full max-w-md rounded-[32px] border border-[#dce6dc] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <button
                onClick={onClose}
                className="absolute right-5 top-5 rounded-full bg-[#f4f7f1] p-2"
            >
                <X size={20} />
            </button>

            <h1 className="mb-2 text-center text-4xl font-bold text-[#1f4d2e]">
                Login
            </h1>

            <p className="mb-8 text-center text-sm text-[#6b7b6d]">
                Masuk untuk melanjutkan eksplorasi herbal nusantara.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 outline-none"
                />

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 pr-14 outline-none"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                        {showPassword ? (
                            <Eye size={20} />
                        ) : (
                            <EyeOff size={20} />
                        )}
                    </button>
                </div>

                <button
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-2xl bg-[#1f4d2e] py-4 font-semibold text-white"
                >
                    {loading ? "Loading..." : "Masuk"}
                </button>

                <div className="text-center">
                    <p className="text-sm text-[#5f6f61]">Belum punya akun?</p>

                    <button
                        type="button"
                        onClick={onOpenRegister}
                        className="mt-2 font-semibold text-[#2f6b3f]"
                    >
                        Daftar sekarang
                    </button>
                </div>
            </form>
        </div>
    );
}
