"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";

import DashboardHeader from "@/app/components/DashboardHeader";
import LoadingButton from "@/app/components/LoadingButton";

import { CATEGORIES_UPDATED_EVENT } from "@/app/hooks/useCategories";

interface Props {
    categories: any[];
}

export default function CategoriesContent({
    categories: initialCategories,
}: Props) {
    const router = useRouter();

    const [categories, setCategories] = useState(initialCategories);

    const [search, setSearch] = useState("");

    const [limit, setLimit] = useState(10);

    const [page, setPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);

    const [loading, setLoading] = useState(false);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const [name, setName] = useState("");

    const filteredCategories = useMemo(() => {
        return categories.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase()),
        );
    }, [categories, search]);

    const totalPages = Math.ceil(filteredCategories.length / limit);

    const paginatedCategories = useMemo(() => {
        const start = (page - 1) * limit;

        return filteredCategories.slice(start, start + limit);
    }, [filteredCategories, limit, page]);

    /* Kabari Sidebar di tab yang sama, lalu segarkan data server. */
    function notifyCategoriesUpdated() {
        window.dispatchEvent(new Event(CATEGORIES_UPDATED_EVENT));

        router.refresh();
    }

    async function handleCreate() {
        if (!name.trim()) return;

        if (loading) return;

        setLoading(true);

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setCategories((prev: any) => [data, ...prev]);

                setShowCreateModal(false);

                setName("");

                notifyCategoriesUpdated();
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleEdit() {
        if (!selectedCategory) return;

        if (loading) return;

        setLoading(true);

        try {
            const res = await fetch(
                `/api/categories/${selectedCategory.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                    }),
                },
            );

            const data = await res.json();

            if (res.ok) {
                setCategories((prev: any) =>
                    prev.map((item: any) =>
                        item.id === selectedCategory.id ? data : item,
                    ),
                );

                setShowEditModal(false);

                setSelectedCategory(null);

                setName("");

                notifyCategoriesUpdated();
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (deletingId) return;

        const confirmDelete = confirm("Hapus kategori ini?");

        if (!confirmDelete) return;

        setDeletingId(id);

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setCategories((prev: any) =>
                    prev.filter((item: any) => item.id !== id),
                );

                notifyCategoriesUpdated();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <>
            <main>
                {/* HERO */}
                <div className="mb-10">
                    <DashboardHeader
                        title="Kelola Kategori"
                        description="Atur kategori herbal nusantara untuk mengelompokkan artikel dengan lebih rapi dan terstruktur."
                    >
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#1f4d2e] shadow-md transition hover:scale-105"
                        >
                            <FiPlus />
                            Tambah Kategori
                        </button>
                    </DashboardHeader>
                </div>

                {/* HEADER */}
                <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <div className="flex h-[64px] items-center rounded-2xl border border-[#dce6dc] bg-white px-5 shadow-sm transition focus-within:border-[#7dbb43]">
                            <input
                                type="text"
                                placeholder="Cari kategori..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);

                                    setPage(1);
                                }}
                                className="w-full bg-transparent text-[15px] font-medium text-[#1f4d2e] outline-none placeholder:text-[#8a968c]"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex h-[64px] items-center rounded-2xl border border-[#dce6dc] bg-white px-4 shadow-sm">
                            <div className="w-full">
                                <p className="mb-1 text-xs font-medium text-[#5f6f61]">
                                    Tampilkan
                                </p>

                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));

                                        setPage(1);
                                    }}
                                    className="w-full bg-transparent text-sm font-semibold text-[#1f4d2e] outline-none"
                                >
                                    <option value={10}>10 Data</option>

                                    <option value={50}>50 Data</option>

                                    <option value={100}>100 Data</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex h-[64px] items-center rounded-2xl border border-[#dce6dc] bg-white px-4 shadow-sm">
                            <div>
                                <p className="text-xs font-medium text-[#5f6f61]">
                                    Total Kategori
                                </p>

                                <h3 className="text-xl font-black text-[#1f4d2e]">
                                    {filteredCategories.length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-[32px] border border-[#dce6dc] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-[#f4f7f1]">
                                <tr>
                                    <th className="px-8 py-5 text-left">
                                        Nama
                                    </th>

                                    <th className="px-8 py-5 text-left">
                                        Slug
                                    </th>

                                    <th className="px-8 py-5 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedCategories.map((item: any) => (
                                    <tr key={item.id} className="border-t border-gray-700/20">
                                        <td className="px-8 py-6 font-bold text-[#1f4d2e]">
                                            {item.name}
                                        </td>

                                        <td className="px-8 py-6">
                                            <span className="rounded-full bg-[#eef6ec] px-4 py-2 text-sm font-medium text-[#1f4d2e]">
                                                {item.slug}
                                            </span>
                                        </td>

                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory(
                                                            item,
                                                        );

                                                        setName(item.name);

                                                        setShowEditModal(true);
                                                    }}
                                                    className="flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white"
                                                >
                                                    <FiEdit2 />
                                                    Edit
                                                </button>

                                                <LoadingButton
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    loading={
                                                        deletingId ===
                                                        item.id
                                                    }
                                                    loadingText="Menghapus..."
                                                    className="flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white"
                                                >
                                                    <FiTrash2 />
                                                    Hapus
                                                </LoadingButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-[#1f4d2e]">
                                Tambah Kategori
                            </h2>

                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="rounded-xl p-2 transition hover:bg-gray-100"
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Nama kategori"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mb-6 w-full rounded-2xl border border-[#dce6dc] px-5 py-4 outline-none focus:border-[#7dbb43]"
                        />

                        <LoadingButton
                            onClick={handleCreate}
                            loading={loading}
                            loadingText="Menyimpan..."
                            className="w-full rounded-2xl bg-[#1f4d2e] px-5 py-4 font-bold text-white"
                        >
                            Tambah Kategori
                        </LoadingButton>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-[#1f4d2e]">
                                Edit Kategori
                            </h2>

                            <button
                                onClick={() => setShowEditModal(false)}
                                className="rounded-xl p-2 transition hover:bg-gray-100"
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mb-6 w-full rounded-2xl border border-[#dce6dc] px-5 py-4 outline-none focus:border-[#7dbb43]"
                        />

                        <LoadingButton
                            onClick={handleEdit}
                            loading={loading}
                            loadingText="Menyimpan..."
                            className="w-full rounded-2xl bg-[#1f4d2e] px-5 py-4 font-bold text-white"
                        >
                            Simpan Perubahan
                        </LoadingButton>
                    </div>
                </div>
            )}
        </>
    );
}
