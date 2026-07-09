"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
    FiChevronDown,
    FiMessageCircle,
    FiHome,
    FiFeather,
    FiBookOpen,
    FiActivity,
    FiInfo,
    FiHeart,
    FiFolder,
    FiGrid,
    FiX,
} from "react-icons/fi";

const menus = [
    {
        name: "Rimpang",
        href: "/rimpang",
        icon: FiFeather,
    },
    {
        name: "Rempah",
        href: "/rempah",
        icon: FiGrid,
    },
    {
        name: "Daun",
        href: "/daun",
        icon: FiBookOpen,
    },
    {
        name: "Penyakit",
        href: "/penyakit",
        icon: FiActivity,
    },
    {
        name: "Informasi",
        href: "/informasi",
        icon: FiInfo,
    },
    {
        name: "Tips Sehat",
        href: "/tips-sehat",
        icon: FiHeart,
    },
];

const adminMenus = [
    {
        name: "Kelola Artikel",
        href: "/dashboard/articles",
    },
    {
        name: "Kelola Kategori",
        href: "/dashboard/categories",
    },
];

interface SidebarProps {
    activeMenu?: string;

    user?: {
        name: string;
        role: string;
    } | null;

    mobileOpen?: boolean;

    onCloseMobile?: () => void;
}

function SidebarComponent({
    activeMenu,
    user,
    mobileOpen,
    onCloseMobile,
}: SidebarProps) {
    const pathname = usePathname();

    const isAdmin = user?.role === "ADMIN";

    const [openMenu, setOpenMenu] = useState(true);

    const [openAdminMenu, setOpenAdminMenu] = useState(true);

    useEffect(() => {
        const savedMain = localStorage.getItem("sidebar-main-menu");

        const savedAdmin = localStorage.getItem("sidebar-admin-menu");

        if (savedMain !== null) {
            setOpenMenu(savedMain === "true");
        }

        if (savedAdmin !== null) {
            setOpenAdminMenu(savedAdmin === "true");
        }
    }, []);

    function toggleMenu() {
        const next = !openMenu;

        setOpenMenu(next);

        localStorage.setItem("sidebar-main-menu", String(next));
    }

    function toggleAdminMenu() {
        const next = !openAdminMenu;

        setOpenAdminMenu(next);

        localStorage.setItem("sidebar-admin-menu", String(next));
    }

    return (
        <aside
            className={`
        custom-scrollbar

        fixed left-0 top-0 z-[999]
        h-[100dvh] w-[88vw] max-w-[340px]
        overflow-y-auto

        border-r border-white/10

        bg-gradient-to-b
        from-[#16361f]/95
        via-[#183c24]/95
        to-[#102817]/95

        text-white
        shadow-[0_10px_60px_rgba(0,0,0,0.45)]
        backdrop-blur-3xl

        transition-all duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]

        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

        /* DESKTOP */
        lg:fixed
        lg:left-0
        lg:top-0
        lg:h-screen
        lg:w-[290px]
        lg:max-w-none
        lg:translate-x-0
    `}
        >
            <div className="flex min-h-full flex-col justify-between p-5">
                <div>
                    {/* MOBILE HEADER */}
                    <div className="mb-6 flex items-center justify-between lg:hidden">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-[#b9d9a8]">
                                Navigation
                            </p>

                            <h2 className="mt-1 text-lg font-semibold">
                                Jamoe Djawa
                            </h2>
                        </div>

                        <button
                            onClick={onCloseMobile}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl"
                        >
                            <FiX className="text-xl" />
                        </button>
                    </div>

                    {/* LOGO */}
                    <div className="mb-8 hidden lg:block">
                        <div className="relative overflow-hidden rounded-[30px] border border-white/20 bg-gradient-to-br from-[#f7f9f4] to-[#dff0d2] p-5 shadow-2xl">
                            <img
                                src="/logo-jd.png"
                                alt="Jamoe Djawa"
                                className="relative z-10 w-full object-contain"
                            />
                        </div>
                    </div>

                    {/* BERANDA */}
                    <div className="mb-3">
                        <Link
                            href="/"
                            onClick={onCloseMobile}
                            className={`group flex items-center gap-4 rounded-3xl px-4 py-4 transition-all duration-300 ${
                                pathname === "/"
                                    ? "bg-white text-[#183c24] shadow-xl"
                                    : "bg-white/5 text-[#dce6dc] hover:bg-white/10"
                            }`}
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                <FiHome className="text-[19px]" />
                            </div>

                            <div>
                                <p className="font-medium">Beranda</p>

                                <p className="text-xs opacity-70">
                                    Halaman utama
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* FORUM */}
                    <div className="mb-6">
                        <Link
                            href="/forum"
                            onClick={onCloseMobile}
                            className={`group flex items-center gap-4 rounded-3xl px-4 py-4 transition-all duration-300 ${
                                pathname.startsWith("/forum")
                                    ? "bg-white text-[#183c24] shadow-xl"
                                    : "bg-white/5 text-[#dce6dc] hover:bg-white/10"
                            }`}
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                <FiMessageCircle className="text-[19px]" />
                            </div>

                            <div>
                                <p className="font-medium">Forum Diskusi</p>

                                {!user && (
                                    <p className="text-xs text-[#b9d9a8]">
                                        Login untuk ikut chat
                                    </p>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* ADMIN */}
                    {isAdmin && (
                        <div className="mb-6">
                            <button
                                onClick={toggleAdminMenu}
                                className="mb-4 flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4"
                            >
                                <p className="text-xs uppercase tracking-[0.3em] text-[#b9d9a8]">
                                    Admin Menu
                                </p>

                                <FiChevronDown
                                    className={`transition ${
                                        openAdminMenu ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    openAdminMenu
                                        ? "max-h-[300px] opacity-100"
                                        : "max-h-0 opacity-0"
                                }`}
                            >
                                <nav className="flex flex-col gap-2">
                                    {adminMenus.map((menu) => {
                                        const isActive = pathname.startsWith(
                                            menu.href,
                                        );

                                        return (
                                            <Link
                                                key={menu.href}
                                                href={menu.href}
                                                onClick={onCloseMobile}
                                                className={`flex items-center gap-4 rounded-3xl px-4 py-4 transition-all duration-300 ${
                                                    isActive
                                                        ? "bg-white text-[#183c24]"
                                                        : "text-[#dce6dc] hover:bg-white/10"
                                                }`}
                                            >
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                                    <FiFolder className="text-[18px]" />
                                                </div>

                                                <span>{menu.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* HERBAL MENU */}
                    <button
                        onClick={toggleMenu}
                        className="mb-4 flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4"
                    >
                        <p className="text-xs uppercase tracking-[0.3em] text-[#b9d9a8]">
                            Herbal Menu
                        </p>

                        <FiChevronDown
                            className={`transition ${
                                openMenu ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    <div
                        className={`overflow-hidden transition-all duration-300 ${
                            openMenu
                                ? "max-h-[700px] opacity-100"
                                : "max-h-0 opacity-0"
                        }`}
                    >
                        <nav className="flex flex-col gap-2">
                            {menus.map((menu) => {
                                const isActive =
                                    pathname === menu.href ||
                                    activeMenu === menu.href;

                                const Icon = menu.icon;

                                return (
                                    <Link
                                        key={menu.href}
                                        href={menu.href}
                                        onClick={onCloseMobile}
                                        className={`group flex items-center gap-4 rounded-3xl px-4 py-4 transition-all duration-300 ${
                                            isActive
                                                ? "bg-white text-[#183c24] shadow-xl"
                                                : "text-[#dce6dc] hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                            <Icon className="text-[18px]" />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                {menu.name}
                                            </p>

                                            <p className="text-xs opacity-70">
                                                Tanaman herbal
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* BOTTOM */}
                <div className="mt-8">
                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                        <h3 className="text-lg font-semibold text-[#dff0d2]">
                            Herbal Alami
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-[#b9d9a8]">
                            Edukasi tanaman herbal tradisional Indonesia.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default memo(SidebarComponent);
