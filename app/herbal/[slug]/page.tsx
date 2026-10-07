import { notFound } from "next/navigation";

import Image from "next/image";

import AppLayout from "../../components/AppLayout";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/categories";

import ArticleComments from "@/app/components/articles/ArticleComments";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

async function getUser() {
    return getCurrentUser();
}

export default async function HerbalDetailPage({ params }: Props) {
    const { slug } = await params;

    const user = await getUser();

    const categories = await getCategories();

    const herb = await prisma.article.findUnique({
        where: {
            slug,
        },
        include: {
            category: true,
        },
    });

    if (!herb) {
        notFound();
    }

    /* Konten format baru disimpan sebagai HTML tersanitasi.
       Artikel lama berupa teks biasa. */
    const isHtmlContent = herb.content.trimStart().startsWith("<");

    return (
        <AppLayout
            user={user}
            categories={categories}
            backHref="/"
            backLabel="Kembali"
            activeMenu="/"
        >
            {/* HERO */}
            <div className="mb-10 rounded-[32px] bg-gradient-to-r from-[#1f4d2e] via-[#2f6b3f] to-[#7dbb43] p-10 text-white shadow-xl">
                <h1 className="text-5xl font-bold">{herb.name}</h1>

                <p className="mt-4 max-w-3xl text-lg text-[#eef7e8]">
                    Eksplorasi manfaat, kandungan, dan khasiat herbal
                    tradisional nusantara.
                </p>
            </div>

            {/* DETAIL */}
            <div className="rounded-[32px] border border-[#dce6dc] bg-white p-8 shadow-sm">
                <div className="grid gap-10 lg:grid-cols-2">
                    {/* IMAGE */}
                    <div className="overflow-hidden rounded-[28px] bg-[#f5f7f5]">
                        <Image
                            src={herb.image}
                            alt={herb.name}
                            width={1280}
                            height={720}
                            sizes="(max-width:1024px) 100vw, 50vw"
                            className="h-full max-h-[500px] w-full object-cover"
                        />
                    </div>

                    {/* CONTENT */}
                    <div className="flex flex-col justify-center">
                        <h2 className="mb-6 text-4xl font-bold text-[#1f4d2e]">
                            {herb.name}
                        </h2>

                        <div className="space-y-6 text-[17px] leading-relaxed text-[#425445]">
                            <div>
                                <h3 className="mb-2 text-lg font-bold text-[#1f4d2e]">
                                    Deskripsi
                                </h3>

                                <p className="whitespace-pre-line break-words">
                                    {herb.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="mb-2 text-lg font-bold text-[#1f4d2e]">
                                    Nama Latin
                                </h3>

                                <p>{herb.latinName || "-"}</p>
                            </div>

                            <div>
                                <h3 className="mb-2 text-lg font-bold text-[#1f4d2e]">
                                    Kategori
                                </h3>

                                <p>{herb.category.name}</p>
                            </div>

                            {!isHtmlContent && (
                                <div>
                                    <h3 className="mb-2 text-lg font-bold text-[#1f4d2e]">
                                        Khasiat
                                    </h3>

                                    <p className="whitespace-pre-line break-words">
                                        {herb.benefits}
                                    </p>
                                </div>
                            )}

                            {isHtmlContent ? (
                                /* Konten format baru: satu blok HTML,
                                   sudah disanitasi di server saat simpan. */
                                <div
                                    className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-[#1f4d2e] prose-strong:text-[#1f4d2e] prose-a:text-[#2f6b3f] prose-a:underline prose-blockquote:border-l-[#7dbb43] prose-blockquote:text-[#5f6f61] prose-img:rounded-3xl"
                                    dangerouslySetInnerHTML={{
                                        __html: herb.content,
                                    }}
                                />
                            ) : (
                                <div>
                                    <h3 className="mb-2 text-lg font-bold text-[#1f4d2e]">
                                        Konten
                                    </h3>

                                    <p className="whitespace-pre-line break-words">
                                        {herb.content}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* VIDEO */}
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
                {herb.video1 && (
                    <div className="rounded-[28px] border border-[#dce6dc] bg-white p-5 shadow-sm">
                        <h2 className="mb-5 text-2xl font-bold text-[#1f4d2e]">
                            Video Edukasi
                        </h2>

                        <video controls className="w-full rounded-2xl">
                            <source src={herb.video1} />
                        </video>
                    </div>
                )}

                {herb.video2 && (
                    <div className="rounded-[28px] border border-[#dce6dc] bg-white p-5 shadow-sm">
                        <h2 className="mb-5 text-2xl font-bold text-[#1f4d2e]">
                            Cara Pengolahan
                        </h2>

                        <video controls className="w-full rounded-2xl">
                            <source src={herb.video2} />
                        </video>
                    </div>
                )}
            </div>

            {/* COMMENTS */}
            <div className="mt-10">
                <ArticleComments articleId={herb.id} user={user} />
            </div>
        </AppLayout>
    );
}
