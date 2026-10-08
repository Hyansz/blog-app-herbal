"use client";

import type { ReactNode } from "react";

interface DashboardHeaderProps {
    title: string;
    description?: string;
    eyebrow?: string;
    icon?: ReactNode;
    children?: ReactNode;
}

/* Header standar halaman dashboard: eyebrow + judul + deskripsi
   di kiri, slot aksi (children) di kanan. Lebar kontainer diatur
   oleh halaman pemakai. */
export default function DashboardHeader({
    title,
    description,
    eyebrow = "Dashboard Admin",
    icon,
    children,
}: DashboardHeaderProps) {
    return (
        <div className="rounded-2xl border border-[#31543d] bg-gradient-to-br from-[#17351f] via-[#1f4d2e] to-[#7dbb43] p-5 text-white shadow-[0_20px_60px_rgba(16,40,23,0.25)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#dff0d2]">
                        {eyebrow}
                    </p>

                    <h1 className="mt-2 flex min-w-0 flex-wrap items-center gap-3 text-2xl font-black leading-tight sm:text-3xl">
                        {icon}
                        {title}
                    </h1>

                    {description ? (
                        <p className="mt-1.5 hidden text-sm leading-relaxed text-[#eef7e8] sm:block">
                            {description}
                        </p>
                    ) : null}
                </div>

                {children ? (
                    <div className="flex flex-wrap items-center gap-3 self-start">
                        {children}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
