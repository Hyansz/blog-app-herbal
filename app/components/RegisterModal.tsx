"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";

interface Props {
    onClose: () => void;
    onOpenLogin: () => void;
}

export default function RegisterModal({ onClose, onOpenLogin }: Props) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            if (res.ok) {
                onOpenLogin();
            } else {
                alert("Register gagal");
            }
        } catch {
            alert("Terjadi kesalahan");
        }

        setLoading(false);
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
            <div className="relative w-full max-w-md rounded-[32px] border border-[#dce6dc] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 rounded-full bg-[#f4f7f1] p-2 transition hover:scale-110"
                >
                    <X size={20} />
                </button>

                <h1 className="mb-2 text-center text-4xl font-bold text-[#1f4d2e]">
                    Register
                </h1>

                <p className="mb-8 text-center text-sm text-[#6b7b6d]">
                    Buat akun baru untuk mulai membaca artikel herbal.
                </p>

                <form onSubmit={handleRegister} className="space-y-5">
                    <input
                        type="text"
                        placeholder="Nama"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 outline-none transition focus:border-[#2f6b3f] focus:ring-4 focus:ring-[#dcefdc]"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 outline-none transition focus:border-[#2f6b3f] focus:ring-4 focus:ring-[#dcefdc]"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-[#dce6dc] px-5 py-4 pr-14 outline-none transition focus:border-[#2f6b3f] focus:ring-4 focus:ring-[#dcefdc]"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7b6d]"
                        >
                            {showPassword ? (
                                <Eye size={20} />
                            ) : (
                                <EyeOff size={20} />
                            )}
                        </button>
                    </div>

                    <button className="flex w-full items-center justify-center rounded-2xl bg-[#1f4d2e] py-4 font-semibold text-white transition hover:bg-[#163924]">
                        {loading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            "Daftar"
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-[#5f6f61]">
                            Sudah punya akun?
                        </p>

                        <button
                            type="button"
                            onClick={onOpenLogin}
                            className="mt-2 font-semibold text-[#2f6b3f] transition hover:scale-105"
                        >
                            Masuk sekarang
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
