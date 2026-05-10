"use client";

import { useState } from "react";

import HerbCard from "./components/HerbCard";
import AppLayout from "./components/AppLayout";

import { herbs } from "@/data/herbs";

export default function HomePage() {
    const [search, setSearch] = useState("");

    const filteredHerbs = herbs.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout search={search} setSearch={setSearch} activeMenu="/">
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

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                    Herbal Populer
                </h2>

                <p className="mt-2 text-gray-500">
                    Jelajahi berbagai tanaman herbal nusantara.
                </p>
            </div>

            {filteredHerbs.length === 0 ? (
                <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                    <p className="text-lg text-gray-500">
                        Data herbal tidak ditemukan.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredHerbs.map((herb) => (
                        <HerbCard key={herb.slug} herb={herb} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
