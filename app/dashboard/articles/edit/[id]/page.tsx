"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { FiArrowLeft, FiEdit3, FiImage, FiVideo } from "react-icons/fi";

import AppLayout from "@/app/components/AppLayout";

export default function EditArticlePage() {
    const router = useRouter();

    const params = useParams();

    const [user, setUser] = useState<any>(null);

    const [categories, setCategories] = useState<any[]>([]);

    const [uploading, setUploading] = useState(false);

    const [loading, setLoading] = useState(false);

    const [fetching, setFetching] = useState(true);

    const [form, setForm] = useState({
        name: "",
        latinName: "",
        image: "",
        description: "",
        benefits: "",
        content: "",
        video1: "",
        video2: "",
        categoryId: "",
    });

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => setUser(data));

        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => setCategories(data));

        fetch(`/api/articles/${params.id}`)
            .then((res) => res.json())
            .then((data) => {
                setForm({
                    name: data.name || "",
                    latinName: data.latinName || "",
                    image: data.image || "",
                    description: data.description || "",
                    benefits: data.benefits || "",
                    content: data.content || "",
                    video1: data.video1 || "",
                    video2: data.video2 || "",
                    categoryId: data.categoryId || "",
                });

                setFetching(false);
            });
    }, [params.id]);

    async function uploadFile(file: File) {
        const formData = new FormData();

        formData.append("file", file);

        setUploading(true);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        setUploading(false);

        return data.url;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);

        try {
            const res = await fetch(`/api/articles/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                throw new Error("Gagal update artikel");
            }

            router.push("/dashboard/articles");

            router.refresh();
        } catch (error) {
            console.error(error);

            alert("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <AppLayout activeMenu="/dashboard/articles">
                <main className="min-h-screen bg-[#f4f7f1]">
                    <div className="mx-auto max-w-7xl animate-pulse">
                        {/* HERO */}
                        <div className="mb-10 rounded-[36px] bg-[#dce6dc] p-10">
                            <div className="h-5 w-40 rounded-full bg-[#cfd9cf]" />

                            <div className="mt-6 h-14 w-[320px] rounded-2xl bg-[#cfd9cf]" />

                            <div className="mt-6 space-y-3">
                                <div className="h-4 w-full rounded-full bg-[#cfd9cf]" />
                                <div className="h-4 w-5/6 rounded-full bg-[#cfd9cf]" />
                                <div className="h-4 w-4/6 rounded-full bg-[#cfd9cf]" />
                            </div>
                        </div>

                        {/* FORM CARD */}
                        <div className="rounded-[36px] bg-white p-8 shadow-xl">
                            <div className="mb-8 h-10 w-64 rounded-2xl bg-[#dce6dc]" />

                            <div className="space-y-6">
                                {/* INPUT */}
                                <div className="h-14 w-full rounded-2xl bg-[#eef2ea]" />

                                <div className="h-14 w-full rounded-2xl bg-[#eef2ea]" />

                                <div className="h-14 w-full rounded-2xl bg-[#eef2ea]" />

                                {/* IMAGE */}
                                <div>
                                    <div className="mb-3 h-5 w-32 rounded-full bg-[#dce6dc]" />

                                    <div className="h-14 w-full rounded-2xl bg-[#eef2ea]" />

                                    <div className="mt-4 h-64 w-full rounded-[28px] bg-[#eef2ea]" />
                                </div>

                                {/* TEXTAREA */}
                                <div className="h-36 w-full rounded-2xl bg-[#eef2ea]" />

                                <div className="h-36 w-full rounded-2xl bg-[#eef2ea]" />

                                <div className="h-52 w-full rounded-2xl bg-[#eef2ea]" />

                                {/* VIDEO */}
                                <div>
                                    <div className="mb-3 h-5 w-32 rounded-full bg-[#dce6dc]" />

                                    <div className="h-14 w-full rounded-2xl bg-[#eef2ea]" />

                                    <div className="mt-4 h-64 w-full rounded-[28px] bg-[#eef2ea]" />
                                </div>

                                <div>
                                    <div className="mb-3 h-5 w-32 rounded-full bg-[#dce6dc]" />

                                    <div className="h-14 w-full rounded-2xl bg-[#eef2ea]" />

                                    <div className="mt-4 h-64 w-full rounded-[28px] bg-[#eef2ea]" />
                                </div>

                                {/* BUTTON */}
                                <div className="flex gap-4 pt-4">
                                    <div className="h-14 flex-1 rounded-2xl bg-[#dce6dc]" />

                                    <div className="h-14 flex-1 rounded-2xl bg-[#dce6dc]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </AppLayout>
        );
    }

    return (
        <AppLayout user={user} activeMenu="/dashboard/articles">
            <div className="space-y-8">
                {/* HERO */}
                <div className="relative overflow-hidden rounded-[36px] border border-[#31543d] bg-gradient-to-br from-[#17351f] via-[#1f4d2e] to-[#7dbb43] p-10 text-white shadow-[0_20px_60px_rgba(16,40,23,0.25)]">
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#dff0d2]">
                                Dashboard Admin
                            </p>

                            <h1 className="flex items-center gap-4 text-5xl font-black leading-tight lg:text-6xl">
                                <FiEdit3 />
                                Edit Artikel
                            </h1>

                            <p className="mt-5 text-lg leading-relaxed text-[#eef7e8]">
                                Perbarui informasi artikel herbal nusantara
                                lengkap dengan gambar, video, manfaat, dan
                                konten edukasi.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                            >
                                <FiArrowLeft className="text-lg" />
                                Kembali
                            </button>

                            <Link
                                href="/dashboard/articles"
                                className="rounded-2xl bg-white px-7 py-4 font-bold text-[#1f4d2e] shadow-lg transition hover:scale-105"
                            >
                                Batal
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div className="rounded-[36px] border border-[#dce6dc] bg-white p-8 shadow-[0_15px_45px_rgba(0,0,0,0.06)]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* BASIC */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div>
                                <label className="mb-3 block text-sm font-bold text-[#1f4d2e]">
                                    Nama Artikel
                                </label>

                                <input
                                    type="text"
                                    placeholder="Masukkan nama artikel"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-2xl border border-[#dce6dc] bg-[#f9fbf8] p-4 outline-none transition focus:border-[#7dbb43]"
                                />
                            </div>

                            <div>
                                <label className="mb-3 block text-sm font-bold text-[#1f4d2e]">
                                    Nama Latin
                                </label>

                                <input
                                    type="text"
                                    placeholder="Masukkan nama latin"
                                    value={form.latinName}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            latinName: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-2xl border border-[#dce6dc] bg-[#f9fbf8] p-4 outline-none transition focus:border-[#7dbb43]"
                                />
                            </div>
                        </div>

                        {/* CATEGORY */}
                        <div>
                            <label className="mb-3 block text-sm font-bold text-[#1f4d2e]">
                                Kategori Herbal
                            </label>

                            <select
                                value={form.categoryId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        categoryId: e.target.value,
                                    })
                                }
                                className="w-full rounded-2xl border border-[#dce6dc] bg-[#f9fbf8] p-4 outline-none transition focus:border-[#7dbb43]"
                            >
                                <option value="">Pilih kategori herbal</option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* IMAGE */}
                        <div className="rounded-[28px] border border-dashed border-[#cfe0c9] bg-[#f9fbf8] p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef6ec]">
                                    <FiImage className="text-2xl text-[#4d8b5e]" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#1f4d2e]">
                                        Update Gambar
                                    </h3>

                                    <p className="text-sm text-[#5f6f61]">
                                        Ganti gambar utama artikel
                                    </p>
                                </div>
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];

                                    if (!file) return;

                                    const url = await uploadFile(file);

                                    setForm({
                                        ...form,
                                        image: url,
                                    });
                                }}
                            />

                            {uploading && (
                                <p className="mt-4 text-sm text-[#5f6f61]">
                                    Uploading...
                                </p>
                            )}

                            {form.image && (
                                <img
                                    src={form.image}
                                    alt="Preview"
                                    className="mt-6 h-72 w-full rounded-3xl object-cover"
                                />
                            )}
                        </div>

                        {/* TEXTAREA */}
                        <div className="space-y-6">
                            <div>
                                <label className="mb-3 block text-sm font-bold text-[#1f4d2e]">
                                    Deskripsi
                                </label>

                                <textarea
                                    placeholder="Tulis deskripsi artikel..."
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    className="h-36 w-full rounded-2xl border border-[#dce6dc] bg-[#f9fbf8] p-5 outline-none transition focus:border-[#7dbb43]"
                                />
                            </div>

                            <div>
                                <label className="mb-3 block text-sm font-bold text-[#1f4d2e]">
                                    Manfaat Herbal
                                </label>

                                <textarea
                                    placeholder="Tulis manfaat herbal..."
                                    value={form.benefits}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            benefits: e.target.value,
                                        })
                                    }
                                    className="h-36 w-full rounded-2xl border border-[#dce6dc] bg-[#f9fbf8] p-5 outline-none transition focus:border-[#7dbb43]"
                                />
                            </div>

                            <div>
                                <label className="mb-3 block text-sm font-bold text-[#1f4d2e]">
                                    Konten Artikel
                                </label>

                                <textarea
                                    placeholder="Tulis isi artikel lengkap..."
                                    value={form.content}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            content: e.target.value,
                                        })
                                    }
                                    className="h-64 w-full rounded-2xl border border-[#dce6dc] bg-[#f9fbf8] p-5 outline-none transition focus:border-[#7dbb43]"
                                />
                            </div>
                        </div>

                        {/* VIDEO */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {[1, 2].map((num) => (
                                <div
                                    key={num}
                                    className="rounded-[28px] border border-dashed border-[#cfe0c9] bg-[#f9fbf8] p-6"
                                >
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef6ec]">
                                            <FiVideo className="text-2xl text-[#4d8b5e]" />
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-[#1f4d2e]">
                                                Update Video {num}
                                            </h3>

                                            <p className="text-sm text-[#5f6f61]">
                                                Video edukasi herbal
                                            </p>
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];

                                            if (!file) return;

                                            const url = await uploadFile(file);

                                            setForm({
                                                ...form,
                                                [num === 1
                                                    ? "video1"
                                                    : "video2"]: url,
                                            });
                                        }}
                                    />

                                    {(num === 1
                                        ? form.video1
                                        : form.video2) && (
                                        <video
                                            controls
                                            className="mt-5 w-full rounded-2xl"
                                        >
                                            <source
                                                src={
                                                    num === 1
                                                        ? form.video1
                                                        : form.video2
                                                }
                                            />
                                        </video>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ACTION */}
                        <div className="flex flex-col gap-4 border-t border-[#e5ece4] pt-8 sm:flex-row">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-[#1f4d2e] to-[#2f6b3f] px-8 py-5 text-lg font-bold text-white shadow-lg transition hover:scale-[1.01]"
                            >
                                {loading
                                    ? "Menyimpan Perubahan..."
                                    : "Update Artikel"}
                            </button>

                            <Link
                                href="/dashboard/articles"
                                className="flex items-center justify-center rounded-2xl border border-[#dce6dc] bg-white px-8 py-5 text-lg font-semibold text-[#5f6f61] transition hover:border-[#7dbb43] hover:text-[#1f4d2e]"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
