"use client";

import { useEffect, useState } from "react";

import HerbList from "./HerbList";

interface Props {
    herbs: any[];
}

export default function HomeContent({ herbs }: Props) {
    const [search, setSearch] = useState("");

    useEffect(() => {
        const handleSearch = (e: any) => {
            setSearch(e.detail);
        };

        window.addEventListener("global-search", handleSearch);

        return () => {
            window.removeEventListener("global-search", handleSearch);
        };
    }, []);

    return (
        <>
            {/* HERO */}
            <div className="relative mb-12 overflow-hidden rounded-[36px] border border-[#31543d] bg-gradient-to-br from-[#17351f] via-[#1f4d2e] to-[#7dbb43] p-12 text-white shadow-[0_20px_60px_rgba(16,40,23,0.25)]">
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dff0d2]/10 blur-3xl" />

                <div className="relative z-10 max-w-3xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#dff0d2]">
                        Selamat Datang di
                    </p>

                    <h1 className="text-5xl font-black leading-tight lg:text-6xl">
                        Jamoe Djawa
                    </h1>

                    <p className="mt-5 text-lg leading-relaxed text-[#eef7e8]">
                        Warisan Leluhur Nusantara untuk kesehatan alami dan
                        edukasi herbal tradisional Indonesia.
                    </p>
                </div>
            </div>

            <HerbList
                herbs={herbs}
                search={search}
                title="Semua Herbal Nusantara"
                description="Jelajahi seluruh koleksi herbal tradisional Indonesia."
            />
        </>
    );
}
