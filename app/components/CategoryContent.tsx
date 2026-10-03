"use client";

import { useEffect, useState } from "react";

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
            <HerbList
                herbs={herbs}
                search={search}
                title={title}
                description={`Temukan berbagai tanaman herbal ${title.toLowerCase()} pilihan khas nusantara.`}
                emptyTitle={`${title} Herbal Tidak Ditemukan`}
                emptyDescription={`Coba gunakan kata kunci lain untuk mencari herbal ${title.toLowerCase()}.`}
            />
        </>
    );
}
