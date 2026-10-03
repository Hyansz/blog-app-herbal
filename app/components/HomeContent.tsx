"use client";

import { useEffect, useState } from "react";

import HeroBanner from "./HeroBanner";
import HerbList from "./HerbList";

interface Props {
    herbs: any[];
}

export default function HomeContent({ herbs }: Props) {
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
            <HeroBanner />

            <HerbList
                herbs={herbs}
                search={search}
                title="Semua Herbal Nusantara"
                description="Jelajahi seluruh koleksi herbal tradisional Indonesia."
            />
        </>
    );
}
