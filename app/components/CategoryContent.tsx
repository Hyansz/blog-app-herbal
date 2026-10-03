"use client";

import { useEffect, useState } from "react";

import HeroBanner from "./HeroBanner";
import HerbList from "./HerbList";

interface Props {
    title: string;

    herbs: any[];
}

export default function CategoryContent({ title, herbs }: Props) {
    const [search, setSearch] = useState("");

    useEffect(() => {
        const handleSearch = (e: any) => {
            setSearch(e.detail);
        };

        window.addEventListener("global-search", handleSearch);

        return () => {
            window.removeEventListener("global-search", handleSearch);
        };
    }, []);

    return (
        <>
            <HeroBanner
                eyebrow="Kategori Herbal Nusantara"
                title={title}
                subtitle="Jelajahi kekayaan tanaman herbal tradisional Indonesia yang telah diwariskan turun-temurun sebagai bahan jamu, pengobatan alami, dan penjaga kesehatan tubuh."
            />

            <HerbList
                herbs={herbs}
                search={search}
                title={`Koleksi ${title}`}
                description={`Temukan berbagai tanaman herbal ${title.toLowerCase()} pilihan khas nusantara.`}
                emptyTitle={`${title} Herbal Tidak Ditemukan`}
                emptyDescription={`Coba gunakan kata kunci lain untuk mencari herbal ${title.toLowerCase()}.`}
            />
        </>
    );
}
