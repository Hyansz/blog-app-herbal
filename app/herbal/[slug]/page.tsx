import Link from "next/link";
import { notFound } from "next/navigation";

import Image from "next/image";

import { FiArrowLeft, FiChevronRight } from "react-icons/fi";

import AppLayout from "../../components/AppLayout";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { formatTanggalIndonesia } from "@/lib/time";

import ArticleComments from "@/app/components/articles/ArticleComments";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

/* URL apa pun di teks artikel lama (mis. "Referensi : https://...")
   diubah jadi tautan hanya saat dirender. Data tersimpan tidak
   disentuh. */
const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;

function renderTextWithLinks(text: string) {
    const nodes: React.ReactNode[] = [];

    let cursor = 0;
    let key = 0;
    let match: RegExpExecArray | null;

    URL_PATTERN.lastIndex = 0;

    while ((match = URL_PATTERN.exec(text)) !== null) {
        if (match.index > cursor) {
            nodes.push(text.slice(cursor, match.index));
        }

        const raw = match[0];

        /* Tanda baca penutup ("." ",") tidak ikut di dalam href. */
        const trailing = raw.match(/[.,;:!?)\]]+$/);
        const url = trailing ? raw.slice(0, -trailing[0].length) : raw;
        const suffix = trailing ? trailing[0] : "";

        if (url) {
            nodes.push(
                <a
                    key={`link-${key++}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-[#2f6b3f] underline underline-offset-2 transition hover:text-[#1f4d2e]"
                >
                    {url}
                </a>,
            );
        }

        if (suffix) nodes.push(suffix);

        cursor = match.index + raw.length;
    }

    if (cursor < text.length) nodes.push(text.slice(cursor));

    return nodes;
}

/* Judul section untuk artikel format lama: kecil, beraksen hijau. */
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="mb-3 inline-block border-b-2 border-[#7dbb43] pb-1.5 text-sm font-bold uppercase tracking-[0.18em] text-[#1f4d2e] sm:text-base">
            {children}
        </h2>
    );
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

    const videos = [herb.video1, herb.video2].filter(
        (src): src is string => !!src,
    );

    return (
        <AppLayout user={user} categories={categories} activeMenu="/">
            {/* NAVIGASI TIPIS */}
            <nav className="mb-5 flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                <Link
                    href="/"
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#dce6dc] bg-white px-4 text-sm font-semibold text-[#17351f] transition hover:border-[#7dbb43] hover:bg-[#fafcf9]"
                >
                    <FiArrowLeft aria-hidden />
                    Kembali
                </Link>

                <ol className="flex min-w-0 items-center gap-2 text-sm text-[#6f7d72]">
                    <li className="shrink-0">
                        <Link
                            href="/"
                            className="inline-flex min-h-10 items-center transition hover:text-[#1f4d2e]"
                        >
                            Beranda
                        </Link>
                    </li>

                    <li aria-hidden className="shrink-0 text-[#b9c6ba]">
                        <FiChevronRight />
                    </li>

                    <li className="min-w-0 shrink">
                        <Link
                            href={`/${herb.category.slug}`}
                            className="inline-flex min-h-10 min-w-10 max-w-full items-center truncate transition hover:text-[#1f4d2e]"
                        >
                            {herb.category.name}
                        </Link>
                    </li>

                    <li aria-hidden className="shrink-0 text-[#b9c6ba]">
                        <FiChevronRight />
                    </li>

                    <li className="min-w-0 flex-1">
                        <span
                            className="flex min-h-10 items-center truncate font-semibold text-[#1f4d2e]"
                            title={herb.name}
                        >
                            {herb.name}
                        </span>
                    </li>
                </ol>
            </nav>

            {/* HEADER ARTIKEL */}
            <header className="mb-6">
                <h1 className="text-3xl font-extrabold leading-tight text-[#17351f] sm:text-4xl">
                    {herb.name}
                </h1>

                {herb.latinName ? (
                    <p className="mt-2 text-lg italic text-[#5f6f61]">
                        {herb.latinName}
                    </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                        href={`/${herb.category.slug}`}
                        className="inline-flex h-10 items-center rounded-full border border-[#cfe3cb] bg-[#eef6ec] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#1f4d2e] transition hover:border-[#7dbb43] hover:bg-[#e4f1dd]"
                    >
                        {herb.category.name}
                    </Link>

                    <span className="text-sm text-[#6f7d72]">
                        {formatTanggalIndonesia(herb.createdAt)}
                    </span>
                </div>
            </header>

            {/* DUA KOLOM (lg ke atas) */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
                {/* GAMBAR */}
                <div className="self-start lg:sticky lg:top-24">
                    <div className="relative aspect-video max-h-72 w-full overflow-hidden rounded-2xl border border-[#dce6dc] bg-[#f5f7f5] lg:aspect-[4/3] lg:max-h-none">
                        <Image
                            src={herb.image}
                            alt={herb.name}
                            fill
                            sizes="(max-width:1024px) 100vw, 360px"
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* ISI + VIDEO + KOMENTAR */}
                <div className="min-w-0">
                    {isHtmlContent ? (
                        /* Format baru: satu blok prose. Deskripsi tidak
                           ditampilkan terpisah karena memang diambil
                           dari isi, sehingga akan mengulang. */
                        <div
                            className="max-w-[72ch] text-base leading-7 text-[#33443a] prose prose-headings:font-extrabold prose-headings:text-[#1f4d2e] prose-headings:tracking-tight prose-a:text-[#2f6b3f] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#1f4d2e] prose-blockquote:border-l-4 prose-blockquote:border-[#7dbb43] prose-blockquote:italic prose-blockquote:text-[#5f6f61] prose-img:rounded-xl prose-img:border prose-img:border-[#dce6dc] sm:text-lg sm:leading-8"
                            dangerouslySetInnerHTML={{
                                __html: herb.content,
                            }}
                        />
                    ) : (
                        <div className="max-w-[72ch] space-y-8">
                            <section>
                                <SectionTitle>Deskripsi</SectionTitle>

                                <p className="break-words whitespace-pre-line text-base leading-8 text-[#33443a]">
                                    {renderTextWithLinks(herb.description)}
                                </p>
                            </section>

                            {herb.benefits ? (
                                <section>
                                    <SectionTitle>Khasiat</SectionTitle>

                                    <p className="break-words whitespace-pre-line text-base leading-8 text-[#33443a]">
                                        {renderTextWithLinks(herb.benefits)}
                                    </p>
                                </section>
                            ) : null}

                            <section>
                                <SectionTitle>Konten</SectionTitle>

                                <p className="break-words whitespace-pre-line text-base leading-8 text-[#33443a]">
                                    {renderTextWithLinks(herb.content)}
                                </p>
                            </section>
                        </div>
                    )}

                    {/* VIDEO EDUKASI */}
                    {videos.length > 0 ? (
                        <section className="mt-9 max-w-[72ch]">
                            <SectionTitle>Video Edukasi</SectionTitle>

                            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                                {videos.map((src) => (
                                    <div
                                        key={src}
                                        className="aspect-video max-h-[360px] w-full overflow-hidden rounded-xl border border-[#dce6dc] bg-black"
                                    >
                                        <video
                                            controls
                                            preload="metadata"
                                            className="h-full w-full object-contain"
                                        >
                                            <source src={src} />
                                        </video>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {/* KOMENTAR */}
                    <div className="mt-10">
                        <ArticleComments
                            articleId={herb.id}
                            user={user}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
