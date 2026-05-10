"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
    { name: "Beranda", href: "/" },
    { name: "Rimpang", href: "/rimpang" },
    { name: "Rempah", href: "/rempah" },
    { name: "Daun", href: "/daun" },
    { name: "Penyakit", href: "/penyakit" },
    { name: "Informasi", href: "/informasi" },
    { name: "Tips Sehat", href: "/tips-sehat" },
];

interface SidebarProps {
    activeMenu?: string;
}

export default function Sidebar({ activeMenu }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="sticky top-0 h-screen w-[290px] border-r border-[#31543d] bg-gradient-to-b from-[#16361f] via-[#183c24] to-[#102817] text-white shadow-2xl">
            <div className="flex h-full flex-col p-5">
                {/* LOGO */}
                <div className="mb-10">
                    <div className="relative overflow-hidden rounded-[30px] border border-white/20 bg-gradient-to-br from-[#f7f9f4] to-[#dff0d2] p-5 shadow-2xl">
                        {/* GLOW */}
                        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#7dbb43]/30 blur-3xl" />

                        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#b58b3b]/20 blur-3xl" />

                        {/* LOGO */}
                        <img
                            src="/logo-jd.png"
                            alt="Jamoe Djawa"
                            className="relative z-10 w-full object-contain"
                        />
                    </div>
                </div>

                {/* MENU */}
                <div className="mb-3 px-4">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7fa08a]">
                        Main Menu
                    </p>
                </div>

                <nav className="flex flex-col gap-2">
                    {menus.map((menu) => {
                        const isActive =
                            activeMenu === menu.href || pathname === menu.href;

                        return (
                            <Link
                                key={menu.href}
                                href={menu.href}
                                className={`rounded-2xl px-4 py-4 text-[15px] font-medium transition-all duration-300 ${
                                    isActive
                                        ? "bg-[#7dbb43] text-[#183c24] shadow-[0_10px_25px_rgba(125,187,67,0.35)]"
                                        : "text-[#dce6dc] hover:translate-x-1 hover:bg-[#245434] hover:text-white"
                                }`}
                            >
                                {menu.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER */}
                <div className="mt-auto">
                    <div className="rounded-[30px] border border-[#356347] bg-gradient-to-br from-[#245434] to-[#1b4029] p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-[#dff0d2]">
                            Herbal Alami
                        </h3>

                        <p className="mt-2 text-sm text-[#b9d9a8]">
                            Edukasi tanaman herbal tradisional Indonesia.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
