"use client";

import { useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";

interface Props {
    categories: any[];
}

export default function CategoriesContent({
    categories: initialCategories,
}: Props) {
    const [categories, setCategories] = useState(initialCategories);

    const [search, setSearch] = useState("");

    const [limit, setLimit] = useState(10);

    const [page, setPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);

    const [loading, setLoading] = useState(false);

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

    async function handleCreate() {
        if (!name.trim()) return;

        setLoading(true);

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

        setLoading(false);

        if (res.ok) {
            setCategories((prev: any) => [data, ...prev]);

            setShowCreateModal(false);

            setName("");
        }
    }

    async function handleEdit() {
        if (!selectedCategory) return;

        setLoading(true);

        const res = await fetch(`/api/categories/${selectedCategory.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
            }),
        });

        const data = await res.json();

        setLoading(false);

        if (res.ok) {
            setCategories((prev: any) =>
                prev.map((item: any) =>
                    item.id === selectedCategory.id ? data : item,
                ),
            );

            setShowEditModal(false);

            setSelectedCategory(null);

            setName("");
        }
    }

    async function handleDelete(id: string) {
        const confirmDelete = confirm("Hapus kategori ini?");

        if (!confirmDelete) return;

        const res = await fetch(`/api/categories/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setCategories((prev: any) =>
                prev.filter((item: any) => item.id !== id),
            );
        }
    }

    return (
        <>
            <main>
                {/* HERO */}
                <div className="relative mb-10 overflow-hidden rounded-[36px] border border-[#31543d] bg-gradient-to-br from-[#17351f] via-[#1f4d2e] to-[#7dbb43] p-10 text-white shadow-[0_20px_60px_rgba(16,40,23,0.25)]">
                    <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dff0d2]/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#dff0d2]">
                                Dashboard Admin
                            </p>

                            <h1 className="text-5xl font-black leading-tight lg:text-6xl">
                                Kelola Kategori
                            </h1>

                            <p className="mt-5 text-lg leading-relaxed text-[#eef7e8]">
                                Atur kategori herbal nusantara untuk
                                mengelompokkan artikel dengan lebih rapi dan
                                terstruktur.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 font-bold text-[#1f4d2e] shadow-lg transition hover:scale-105"
                        >
                            <FiPlus />
                            Tambah Kategori
                        </button>
                    </div>
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

                                                <button
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    className="flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white"
                                                >
                                                    <FiTrash2 />
                                                    Hapus
                                                </button>
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

                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="w-full rounded-2xl bg-[#1f4d2e] px-5 py-4 font-bold text-white"
                        >
                            {loading ? "Loading..." : "Tambah Kategori"}
                        </button>
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

                        <button
                            onClick={handleEdit}
                            disabled={loading}
                            className="w-full rounded-2xl bg-[#1f4d2e] px-5 py-4 font-bold text-white"
                        >
                            {loading ? "Loading..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
