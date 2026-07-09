"use client";

import dynamic from "next/dynamic";

import { ReactNode, useEffect, useState } from "react";

import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

import { FiMenu } from "react-icons/fi";

const LoginModal = dynamic(() => import("./LoginModal"), {
    ssr: false,
});

const RegisterModal = dynamic(() => import("./RegisterModal"), {
    ssr: false,
});

interface UserType {
    id?: string;
    name: string;
    role: string;
}

interface AppLayoutProps {
    children: ReactNode;

    user?: UserType | null;

    backHref?: string;
    backLabel?: string;

    activeMenu?: string;
}

export default function AppLayout({
    children,
    user,
    backHref,
    backLabel,
    activeMenu,
}: AppLayoutProps) {
    const [showLogin, setShowLogin] = useState(false);

    const [showRegister, setShowRegister] = useState(false);

    const [showSidebar, setShowSidebar] = useState(false);

    const [search, setSearch] = useState("");

    useEffect(() => {
        document.body.style.overflow =
            showLogin || showRegister || showSidebar ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showLogin, showRegister, showSidebar]);

    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent("global-search", {
                detail: search,
            }),
        );
    }, [search]);

    function closeAllModal() {
        setShowLogin(false);

        setShowRegister(false);

        document.body.style.overflow = "auto";
    }

    return (
        <>
            <main className="relative min-h-screen overflow-x-hidden bg-[#f4f7f1]">
                <div className="flex min-h-screen">
                    {/* DESKTOP SIDEBAR */}
                    <div className="hidden lg:block lg:w-[290px] lg:flex-shrink-0">
                        <Sidebar activeMenu={activeMenu} user={user} />
                    </div>

                    {/* MOBILE SIDEBAR */}
                    <div
                        className={`fixed inset-0 z-[999] lg:hidden ${
                            showSidebar
                                ? "pointer-events-auto"
                                : "pointer-events-none"
                        }`}
                    >
                        {/* OVERLAY */}
                        <div
                            onClick={() => setShowSidebar(false)}
                            className={`absolute inset-0 bg-black/30 backdrop-blur-xl transition-all duration-500 ${
                                showSidebar ? "opacity-100" : "opacity-0"
                            }`}
                        />

                        {/* SIDEBAR */}
                        <Sidebar
                            activeMenu={activeMenu}
                            user={user}
                            mobileOpen={showSidebar}
                            onCloseMobile={() => setShowSidebar(false)}
                        />
                    </div>

                    {/* CONTENT */}
                    <div
                        className={`relative flex min-w-0 flex-1 flex-col lg:min-w-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            showSidebar
                                ? "scale-[0.985] blur-[2px]"
                                : "blur-0"
                        }`}
                    >
                        {/* MOBILE TOPBAR */}
                        <div className="sticky top-0 z-40 border-b border-[#dce6dc]/70 bg-white/70 px-5 py-4 backdrop-blur-2xl lg:hidden">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setShowSidebar(true)}
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#dce6dc] bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
                                >
                                    <FiMenu className="text-2xl text-[#1f4d2e]" />
                                </button>

                                <img
                                    src="/logo-jd.png"
                                    alt="Jamoe Djawa"
                                    className="h-11 object-contain"
                                />
                            </div>
                        </div>

                        <Header
                            search={search}
                            setSearch={setSearch}
                            backHref={backHref}
                            backLabel={backLabel}
                            user={user}
                            onOpenLogin={() => setShowLogin(true)}
                        />

                        <section className="flex-1 p-4 lg:p-8">
                            <div className="mx-auto max-w-7xl">{children}</div>
                        </section>

                        <Footer />
                    </div>
                </div>
            </main>

            {/* LOGIN */}
            {showLogin && (
                <div className="fixed inset-0 z-[999]">
                    <div
                        onClick={closeAllModal}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    <div className="relative z-[1000] flex min-h-screen items-center justify-center p-6">
                        <LoginModal
                            onClose={closeAllModal}
                            onOpenRegister={() => {
                                setShowLogin(false);

                                setShowRegister(true);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* REGISTER */}
            {showRegister && (
                <div className="fixed inset-0 z-[999]">
                    <div
                        onClick={closeAllModal}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    <div className="relative z-[1000] flex min-h-screen items-center justify-center p-6">
                        <RegisterModal
                            onClose={closeAllModal}
                            onOpenLogin={() => {
                                setShowRegister(false);

                                setShowLogin(true);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
