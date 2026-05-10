"use client";

import { useState } from "react";

import HerbCard from "../components/HerbCard";
import AppLayout from "../components/AppLayout";

import { herbs } from "@/data/herbs";

export default function PenyakitPage() {
    const [search, setSearch] = useState("");

    const penyakit = herbs.filter(
        (item) =>
            item.category === "penyakit" &&
            item.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout search={search} setSearch={setSearch} activeMenu="/penyakit">
            {/* HERO */}
            <div className="relative mb-12 overflow-hidden rounded-[36px] border border-[#31543d] bg-gradient-to-br from-[#17351f] via-[#1f4d2e] to-[#7dbb43] p-12 text-white shadow-[0_20px_60px_rgba(16,40,23,0.25)]">
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dff0d2]/10 blur-3xl" />

                <div className="relative z-10 max-w-3xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#dff0d2]">
                        Kategori Herbal Nusantara
                    </p>

                    <h1 className="text-5xl font-black leading-tight lg:text-6xl">
                        Penyakit Herbal
                    </h1>

                    <p className="mt-5 text-lg leading-relaxed text-[#eef7e8]">
                        Jelajahi kekayaan tanaman penyakit tradisional Indonesia
                        yang telah diwariskan turun-temurun sebagai bahan jamu,
                        pengobatan alami, dan penjaga kesehatan tubuh.
                    </p>
                </div>
            </div>

            {/* HEADER */}
            <div className="mb-8 flex items-end justify-between gap-5">
                <div>
                    <h2 className="text-3xl font-black text-[#1f4d2e]">
                        Koleksi penyakit
                    </h2>

                    <p className="mt-2 text-[15px] leading-relaxed text-[#5f6f61]">
                        Temukan berbagai tanaman herbal penyakit pilihan khas
                        nusantara.
                    </p>
                </div>

                <div className="hidden rounded-2xl border border-[#dce6dc] bg-white px-5 py-3 shadow-sm lg:block">
                    <p className="text-sm font-medium text-[#5f6f61]">
                        Total Herbal
                    </p>

                    <h3 className="text-2xl font-black text-[#1f4d2e]">
                        {penyakit.length}
                    </h3>
                </div>
            </div>

            {/* CARD */}
            {penyakit.length === 0 ? (
                <div className="rounded-[30px] border border-[#dce6dc] bg-white p-14 text-center shadow-sm">
                    <h3 className="text-2xl font-bold text-[#1f4d2e]">
                        Herbal Tidak Ditemukan
                    </h3>

                    <p className="mt-3 text-[#5f6f61]">
                        Coba gunakan kata kunci pencarian lain.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {penyakit.map((item) => (
                        <HerbCard key={item.slug} herb={item} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
