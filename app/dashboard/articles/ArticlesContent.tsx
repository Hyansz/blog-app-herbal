"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import DashboardHeader from "@/app/components/DashboardHeader";
import LoadingButton from "@/app/components/LoadingButton";

export default function ArticlesContent() {
    const [search, setSearch] = useState("");

    const [articles, setArticles] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const [deletingId, setDeletingId] = useState<string | null>(null);

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
        if (deletingId) return;

        const confirmDelete = confirm("Hapus artikel?");

        if (!confirmDelete) return;

        setDeletingId(id);

        try {
            await fetch(`/api/articles/${id}`, {
                method: "DELETE",
            });

            setArticles((prev) =>
                prev.filter((article) => article.id !== id),
            );
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <>
            {/* HERO */}
            <div className="mb-12">
                <DashboardHeader
                    title="Kelola Artikel"
                    description="Tambahkan, edit, dan hapus artikel herbal nusantara dengan mudah."
                >
                    <Link
                        href="/dashboard/articles/create"
                        className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-[#1f4d2e] shadow-md transition hover:scale-105"
                    >
                        + Tambah Artikel
                    </Link>
                </DashboardHeader>
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
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width:768px) 100vw, 33vw"
                                    className="object-cover"
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

                                    <LoadingButton
                                        onClick={() => handleDelete(item.id)}
                                        loading={deletingId === item.id}
                                        loadingText="Menghapus..."
                                        className="flex-1 rounded-2xl bg-red-500 py-3 font-semibold text-white"
                                    >
                                        Hapus
                                    </LoadingButton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
