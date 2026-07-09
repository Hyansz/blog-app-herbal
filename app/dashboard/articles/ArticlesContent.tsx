"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ArticlesContent() {
    const [search, setSearch] = useState("");

    const [articles, setArticles] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleSearch = (e: any) => {
            setSearch(e.detail);
        };

        window.addEventListener("global-search", handleSearch);

        return () => {
            window.removeEventListener("global-search", handleSearch);
        };
    }, []);

    useEffect(() => {
        fetch("/api/articles")
            .then((res) => res.json())
            .then((data) => {
                setArticles(data);

                setLoading(false);
            });
    }, []);

    const filteredArticles = useMemo(() => {
        return articles.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase()),
        );
    }, [articles, search]);

    async function handleDelete(id: string) {
        const confirmDelete = confirm("Hapus artikel?");

        if (!confirmDelete) return;

        await fetch(`/api/articles/${id}`, {
            method: "DELETE",
        });

        setArticles((prev) => prev.filter((article) => article.id !== id));
    }

    return (
        <>
            {/* HERO */}
            <div className="relative mb-12 overflow-hidden rounded-[36px] border border-[#31543d] bg-gradient-to-br from-[#17351f] via-[#1f4d2e] to-[#7dbb43] p-12 text-white shadow-[0_20px_60px_rgba(16,40,23,0.25)]">
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dff0d2]/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#dff0d2]">
                            Dashboard Admin
                        </p>

                        <h1 className="text-5xl font-black leading-tight lg:text-6xl">
                            Kelola Artikel
                        </h1>

                        <p className="mt-5 text-lg leading-relaxed text-[#eef7e8]">
                            Tambahkan, edit, dan hapus artikel herbal nusantara
                            dengan mudah.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/articles/create"
                        className="rounded-2xl bg-white px-7 py-4 text-center font-bold text-[#1f4d2e] shadow-lg transition hover:scale-105"
                    >
                        + Tambah Artikel
                    </Link>
                </div>
            </div>

            {/* HEADER */}
            <div className="mb-8 flex items-end justify-between gap-5">
                <div>
                    <h2 className="text-3xl font-black text-[#1f4d2e]">
                        Daftar Artikel
                    </h2>

                    <p className="mt-2 text-[15px] leading-relaxed text-[#5f6f61]">
                        Semua artikel herbal yang sudah ditambahkan.
                    </p>
                </div>

                <div className="hidden rounded-2xl border border-[#dce6dc] bg-white px-5 py-3 shadow-sm lg:block">
                    <p className="text-sm font-medium text-[#5f6f61]">
                        Total Artikel
                    </p>

                    <h3 className="text-2xl font-black text-[#1f4d2e]">
                        {filteredArticles.length}
                    </h3>
                </div>
            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="rounded-[30px] border border-[#dce6dc] bg-white p-14 text-center shadow-sm">
                    <h3 className="text-2xl font-bold text-[#1f4d2e]">
                        Loading...
                    </h3>
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="rounded-[30px] border border-[#dce6dc] bg-white p-14 text-center shadow-sm">
                    <h3 className="text-2xl font-bold text-[#1f4d2e]">
                        Artikel Tidak Ditemukan
                    </h3>

                    <p className="mt-3 text-[#5f6f61]">
                        Coba gunakan kata kunci pencarian lain.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {filteredArticles.map((item) => (
                        <div
                            key={item.id}
                            className="overflow-hidden rounded-[32px] border border-[#dce6dc] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)]"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="p-6">
                                <p className="mb-3 inline-block rounded-full bg-[#eef6ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#1f4d2e]">
                                    {item.category?.name}
                                </p>

                                <h2 className="text-2xl font-black text-[#1f4d2e]">
                                    {item.name}
                                </h2>

                                <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-[#5f6f61]">
                                    {item.description}
                                </p>

                                <div className="mt-6 flex gap-3">
                                    <Link
                                        href={`/dashboard/articles/edit/${item.id}`}
                                        className="flex-1 rounded-2xl bg-blue-500 py-3 text-center font-semibold text-white"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex-1 rounded-2xl bg-red-500 py-3 font-semibold text-white"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
