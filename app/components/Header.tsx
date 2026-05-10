"use client";

import Link from "next/link";

import SearchBar from "./SearchBar";

interface HeaderProps {
    search?: string;
    setSearch?: (value: string) => void;

    backHref?: string;
    backLabel?: string;
}

export default function Header({
    search,
    setSearch,
    backHref,
    backLabel = "Kembali",
}: HeaderProps) {
    const isBackMode = backHref;

    return (
        <header className="sticky top-0 z-50 border-b border-[#dce6dc]/70 bg-white/70 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-5 px-8 py-5">
                <div className="w-full max-w-2xl">
                    {isBackMode ? (
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1f4d2e] to-[#2f6b3f] px-6 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            ← {backLabel}
                        </Link>
                    ) : (
                        <SearchBar value={search || ""} onChange={setSearch!} />
                    )}
                </div>

                <div className="hidden shrink-0 items-center gap-3 md:flex">
                    <div className="h-3 w-3 rounded-full bg-[#7dbb43] shadow-[0_0_15px_rgba(125,187,67,0.7)]" />

                    <p className="text-sm font-medium tracking-wide text-[#5f6f61]">
                        HerbalPedia Indonesia
                    </p>
                </div>
            </div>
        </header>
    );
}
