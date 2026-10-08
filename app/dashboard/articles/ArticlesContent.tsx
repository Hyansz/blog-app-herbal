"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import ConfirmModal from "@/app/components/ConfirmModal";
import DashboardHeader from "@/app/components/DashboardHeader";

/* Bentuk respon GET /api/articles (hanya field yang dipakai daftar). */
interface ArticleListItem {
    id: string;
    name: string;
    slug: string;
    image: string;
    description: string;
    category?: { name: string } | null;
}

export default function ArticlesContent() {
    const [search, setSearch] = useState("");

    const [articles, setArticles] = useState<ArticleListItem[]>([]);

    const [loading, setLoading] = useState(true);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<ArticleListItem | null>(
        null,
    );

    const [deleteError, setDeleteError] = useState<string | null>(null);

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

    function openDelete(item: ArticleListItem) {
        if (deletingId) return;

        setDeleteError(null);
        setDeleteTarget(item);
    }

    async function handleDelete() {
        if (!deleteTarget || deletingId) return;

        const id = deleteTarget.id;

        setDeletingId(id);
        setDeleteError(null);

        let success = false;

        try {
            const res = await fetch(`/api/articles/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);

                setDeleteError(
                    data?.message ||
                        "Gagal menghapus artikel. Coba lagi.",
                );

                return;
            }

            setArticles((prev) =>
                prev.filter((article) => article.id !== id),
            );

            success = true;
        } catch (error) {
            console.error(error);

            setDeleteError(
                "Gagal menghapus artikel. Periksa koneksi Anda lalu coba lagi.",
            );
        } finally {
            setDeletingId(null);

            /* Modal ditutup di finally hanya bila penghapusan berhasil;
               saat gagal modal tetap terbuka agar error terbaca. */
            if (success) setDeleteTarget(null);
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

                                    <button
                                        type="button"
                                        onClick={() => openDelete(item)}
                                        className="flex-1 rounded-2xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                open={Boolean(deleteTarget)}
                title="Hapus artikel?"
                description={
                    <>
                        <span className="font-semibold text-[#17351f]">
                            {deleteTarget?.name}
                        </span>{" "}
                        akan dihapus permanen dari daftar artikel. Komentar
                        pada artikel ini juga ikut terhapus karena relasi
                        cascade. Tindakan ini tidak bisa dibatalkan.
                    </>
                }
                confirmText="Hapus"
                loadingText="Menghapus..."
                loading={deletingId === deleteTarget?.id}
                error={deleteError}
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    );
}
