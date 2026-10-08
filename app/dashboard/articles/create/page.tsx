"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiImage, FiVideo } from "react-icons/fi";

import AppLayout from "@/app/components/AppLayout";
import DashboardHeader from "@/app/components/DashboardHeader";
import LoadingButton from "@/app/components/LoadingButton";
import MediaField from "@/app/components/MediaField";
import RichTextEditor from "@/app/components/RichTextEditor";

type UploadField = "image" | "video1" | "video2";

const labelClass = "mb-2 block text-sm font-semibold text-[#425445]";

const inputClass =
    "h-11 w-full rounded-xl border border-[#dce6dc] bg-[#f9fbf8] px-3.5 py-2.5 text-base text-[#425445] outline-none transition placeholder:text-[#9aa89c] focus:border-[#7dbb43] focus:bg-white focus:ring-2 focus:ring-[#7dbb43]/25";

export default function CreateArticlePage() {
    const router = useRouter();

    const [user, setUser] = useState<any>(null);

    const [categories, setCategories] = useState<any[]>([]);

    const [uploadingField, setUploadingField] = useState<
        UploadField | null
    >(null);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        latinName: "",
        image: "",
        content: "",
        video1: "",
        video2: "",
        categoryId: "",
    });

    useEffect(() => {
        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => setCategories(data));

        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => setUser(data));
    }, []);

    async function uploadFile(file: File, field: UploadField) {
        const formData = new FormData();

        formData.append("file", file);

        setUploadingField(field);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            return data.url;
        } finally {
            setUploadingField(null);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!user?.id) {
            alert("User belum login");

            return;
        }

        if (loading || uploadingField) return;

        setLoading(true);

        try {
            const res = await fetch("/api/articles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },

                /* authorId tidak dikirim: server mengambil dari
                   sesi login. */
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);

                throw new Error(
                    data?.message || "Gagal membuat artikel",
                );
            }

            router.push("/dashboard/articles");

            router.refresh();
        } catch (error) {
            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <AppLayout
            user={user}
            categories={categories}
            activeMenu="/dashboard/articles"
        >
            <div className="space-y-6 pb-28 sm:pb-8">
                {/* HEADER */}
                <div className="mx-auto max-w-4xl">
                    <DashboardHeader
                        title="Tambah Artikel Herbal"
                        description="Tambahkan artikel herbal nusantara lengkap dengan gambar, video, dan konten edukatif."
                    >
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                        >
                            <FiArrowLeft aria-hidden="true" />
                            Kembali
                        </button>
                    </DashboardHeader>
                </div>

                {/* FORM */}
                <div className="mx-auto max-w-4xl rounded-2xl border border-[#dce6dc] bg-white p-4 shadow-[0_15px_45px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 1. INFORMASI DASAR */}
                        <section className="border-b border-[#e5ece4] pb-8">
                            <div className="mb-5">
                                <h2 className="text-base font-bold text-[#1f4d2e]">
                                    1. Informasi Dasar
                                </h2>

                                <p className="mt-1 text-sm text-[#5f6f61]">
                                    Nama artikel, nama latin, dan kategorinya.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="article-name"
                                            className={labelClass}
                                        >
                                            Nama Artikel
                                        </label>

                                        <input
                                            id="article-name"
                                            type="text"
                                            placeholder="Masukkan nama artikel"
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    name: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="article-latin"
                                            className={labelClass}
                                        >
                                            Nama Latin
                                        </label>

                                        <input
                                            id="article-latin"
                                            type="text"
                                            placeholder="Masukkan nama latin"
                                            value={form.latinName}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    latinName: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="article-category"
                                        className={labelClass}
                                    >
                                        Kategori Herbal
                                    </label>

                                    <select
                                        id="article-category"
                                        value={form.categoryId}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                categoryId: e.target.value,
                                            })
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Pilih kategori herbal
                                        </option>

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
                            </div>
                        </section>

                        {/* 2. MEDIA */}
                        <section className="border-b border-[#e5ece4] pb-8">
                            <div className="mb-5">
                                <h2 className="text-base font-bold text-[#1f4d2e]">
                                    2. Media
                                </h2>

                                <p className="mt-1 text-sm text-[#5f6f61]">
                                    Gambar sampul wajib, video bersifat
                                    opsional.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <MediaField
                                    kind="image"
                                    title="Gambar Sampul"
                                    hint="Upload gambar utama artikel herbal"
                                    emptyText="Belum ada gambar"
                                    icon={<FiImage size={18} />}
                                    accept="image/*"
                                    src={form.image}
                                    uploading={uploadingField === "image"}
                                    disabled={uploadingField !== null}
                                    onFile={async (file) => {
                                        const url = await uploadFile(
                                            file,
                                            "image",
                                        );

                                        setForm({
                                            ...form,
                                            image: url,
                                        });
                                    }}
                                />

                                <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
                                    {[1, 2].map((num) => (
                                        <MediaField
                                            key={num}
                                            kind="video"
                                            title={`Video ${num}`}
                                            hint="Video edukasi herbal"
                                            emptyText="Belum ada video"
                                            icon={<FiVideo size={18} />}
                                            accept="video/*"
                                            src={
                                                num === 1
                                                    ? form.video1
                                                    : form.video2
                                            }
                                            uploading={
                                                uploadingField ===
                                                (num === 1
                                                    ? "video1"
                                                    : "video2")
                                            }
                                            disabled={uploadingField !== null}
                                            onFile={async (file) => {
                                                const url =
                                                    await uploadFile(
                                                        file,
                                                        num === 1
                                                            ? "video1"
                                                            : "video2",
                                                    );

                                                setForm({
                                                    ...form,
                                                    [num === 1
                                                        ? "video1"
                                                        : "video2"]: url,
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 3. KONTEN ARTIKEL */}
                        <section>
                            <div className="mb-5">
                                <h2 className="text-base font-bold text-[#1f4d2e]">
                                    3. Konten Artikel
                                </h2>

                                <p className="mt-1 text-sm text-[#5f6f61]">
                                    Tulis isi artikel lengkap dengan judul,
                                    daftar, dan tautan.
                                </p>
                            </div>

                            <div>
                                <span className={labelClass}>
                                    Konten Artikel
                                </span>

                                <RichTextEditor
                                    value={form.content}
                                    onChange={(html) =>
                                        setForm({
                                            ...form,
                                            content: html,
                                        })
                                    }
                                />
                            </div>
                        </section>

                        {/* AKSI */}
                        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-[#e5ece4] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] sm:static sm:mx-0 sm:shadow-none sm:px-0 sm:pb-0">
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                loadingText="Menyimpan..."
                                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#1f4d2e] to-[#2f6b3f] px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:brightness-110 sm:flex-[2]"
                            >
                                Tambah Artikel
                            </LoadingButton>

                            <Link
                                href="/dashboard/articles"
                                className="flex cursor-pointer items-center justify-center rounded-xl border border-[#dce6dc] bg-white px-6 py-3.5 text-base font-semibold text-[#5f6f61] transition hover:border-[#7dbb43] hover:text-[#1f4d2e] sm:flex-1"
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
