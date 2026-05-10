"use client";

import { ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface AppLayoutProps {
    children: ReactNode;

    search?: string;
    setSearch?: (value: string) => void;

    backHref?: string;
    backLabel?: string;

    activeMenu?: string;
}

export default function AppLayout({
    children,
    search,
    setSearch,
    backHref,
    backLabel,
    activeMenu,
}: AppLayoutProps) {
    return (
        <main className="min-h-screen bg-[#f4f7f1]">
            <div className="flex min-h-screen">
                <Sidebar activeMenu={activeMenu} />

                <div className="flex flex-1 flex-col">
                    <Header
                        search={search}
                        setSearch={setSearch}
                        backHref={backHref}
                        backLabel={backLabel}
                    />

                    <section className="flex-1 px-8 py-8">
                        <div className="mx-auto w-full max-w-7xl">
                            {children}
                        </div>
                    </section>

                    <Footer />
                </div>
            </div>
        </main>
    );
}
