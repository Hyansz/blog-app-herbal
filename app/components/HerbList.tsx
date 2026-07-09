"use client";

import { useMemo } from "react";

import HerbCard from "./HerbCard";

interface Herb {
    id: string;
    name: string;
    slug: string;
    image: string;
    description: string;   // ← tambahkan baris ini

    category?: {
        name: string;
        slug: string;
    };
}

interface HerbListProps {
    herbs: Herb[];

    title: string;
    description: string;

    search?: string;

    emptyTitle?: string;
    emptyDescription?: string;
}

export default function HerbList({
    herbs,
    title,
    description,
    search = "",
    emptyTitle = "Herbal Tidak Ditemukan",
    emptyDescription = "Coba gunakan kata kunci lain.",
}: HerbListProps) {
    const filteredHerbs = useMemo(() => {
        return herbs.filter((item) =>
            item.name
                .toLowerCase()
                .includes(search.toLowerCase()),
        );
    }, [herbs, search]);

    return (
        <>
            <div className="mb-8 flex items-end justify-between gap-5">
                <div>
                    <h2 className="text-3xl font-black text-[#1f4d2e]">
                        {title}
                    </h2>

                    <p className="mt-2 text-[15px] leading-relaxed text-[#5f6f61]">
                        {description}
                    </p>
                </div>

                <div className="hidden rounded-2xl border border-[#dce6dc] bg-white px-5 py-3 shadow-sm lg:block">
                    <p className="text-sm font-medium text-[#5f6f61]">
                        Total Herbal
                    </p>

                    <h3 className="text-2xl font-black text-[#1f4d2e]">
                        {filteredHerbs.length}
                    </h3>
                </div>
            </div>

            {filteredHerbs.length === 0 ? (
                <div className="rounded-[30px] border border-[#dce6dc] bg-white p-14 text-center shadow-sm">
                    <h3 className="text-2xl font-bold text-[#1f4d2e]">
                        {emptyTitle}
                    </h3>

                    <p className="mt-3 text-[#5f6f61]">
                        {emptyDescription}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {filteredHerbs.map((item) => (
                        <HerbCard
                            key={item.id}
                            herb={item}
                        />
                    ))}
                </div>
            )}
        </>
    );
}