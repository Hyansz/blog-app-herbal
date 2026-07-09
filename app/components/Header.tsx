"use client";

import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiAlertTriangle, FiLogOut } from "react-icons/fi";

import SearchBar from "./SearchBar";

interface HeaderProps {
    search?: string;

    setSearch?: (value: string) => void;

    backHref?: string;

    backLabel?: string;

    onOpenLogin?: () => void;

    user?: {
        name: string;

        role: string;
    } | null;
}

function HeaderComponent({
    search,
    setSearch,
    backHref,
    backLabel = "Kembali",
    user,
    onOpenLogin,
}: HeaderProps) {
    const isBackMode = !!backHref;

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isAdmin = user?.role === "ADMIN";

    const logoutText = useMemo(() => {
        if (isAdmin) {
            return {
                title: "Keluar dari Dashboard Admin?",
                subtitle:
                    "Sesi admin akan diakhiri dan akses pengelolaan sistem akan ditutup.",

                description:
                    "Pastikan seluruh perubahan data artikel, kategori, dan konten herbal telah tersimpan sebelum keluar dari dashboard.",

                button: "Logout Admin",
            };
        }

        return {
            title: "Keluar dari Akun?",

            subtitle: "Anda akan keluar dari sesi akun HerbalPedia Indonesia.",

            description:
                "Anda masih dapat login kembali kapan saja untuk melanjutkan eksplorasi informasi herbal dan fitur akun lainnya.",

            button: "Logout Akun",
        };
    }, [isAdmin]);

    const handleLogout = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",

                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Logout gagal");
            }

            localStorage.removeItem("role");

            localStorage.removeItem("sidebar-admin-menu");

            document.body.style.overflow = "auto";

            window.location.href = "/";
        } catch (error) {
            console.error(error);

            alert("Gagal logout");
        }
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-[#dce6dc]/70 bg-white/90 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-5 px-8 py-5">
                    <div className="w-full max-w-2xl">
                        {isBackMode ? (
                            <Link
                                href={backHref}
                                prefetch
                                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1f4d2e] to-[#2f6b3f] px-6 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                            >
                                ← {backLabel}
                            </Link>
                        ) : (
                            <SearchBar value={search} onChange={setSearch} />
                        )}
                    </div>

                    <div className="hidden shrink-0 items-center gap-5 md:flex">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-[#7dbb43]" />

                            <p className="text-sm font-medium tracking-wide text-[#5f6f61]">
                                HerbalPedia Indonesia
                            </p>
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="group relative overflow-hidden rounded-[24px] border border-[#dce6dc] bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#eef6ec]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                    <div className="relative flex items-center gap-3">
                                        <div className="text-right leading-tight">
                                            <p className="text-sm font-bold text-[#1f4d2e]">
                                                {user.name}
                                            </p>

                                            <p className="text-xs uppercase tracking-wide text-[#5f6f61]">
                                                {user.role}
                                            </p>
                                        </div>

                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef6ec] to-[#dff0d2] shadow-inner">
                                            <FaUserCircle className="text-[24px] text-[#4d8b5e]" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowLogoutModal(true)}
                                    className="group relative z-[9999] flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#f3d7d7] bg-white text-[#b63b3b] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#fff5f5] to-[#ffecec] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                    <FiLogOut className="relative z-10 text-[20px]" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onOpenLogin}
                                className="flex items-center gap-3 rounded-2xl border border-[#dce6dc] bg-white px-4 py-2 shadow-sm transition-all duration-300 hover:border-[#7dbb43]"
                            >
                                <div>
                                    <p className="text-sm font-bold text-[#1f4d2e]">
                                        Login
                                    </p>

                                    <p className="text-xs text-[#5f6f61]">
                                        Masuk akun
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef6ec]">
                                    <FaUserCircle className="text-3xl text-[#4d8b5e]" />
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffecec] to-[#fff5f5] text-[#d64545]">
                                <FiAlertTriangle className="text-[30px]" />
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-[#1f4d2e]">
                                    {logoutText.title}
                                </h2>

                                <p className="mt-2 text-sm leading-relaxed text-[#5f6f61]">
                                    {logoutText.subtitle}
                                </p>
                            </div>
                        </div>

                        <p className="mt-6 text-[15px] leading-relaxed text-[#5f6f61]">
                            {logoutText.description}
                        </p>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 rounded-2xl border border-[#dce6dc] bg-white py-3 font-semibold text-[#1f4d2e] transition hover:bg-[#f7faf4]"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-[#d64545] to-[#b63b3b] py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
                            >
                                {logoutText.button}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default memo(HeaderComponent);
