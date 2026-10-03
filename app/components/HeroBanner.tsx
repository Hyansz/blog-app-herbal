import { FiFeather } from "react-icons/fi";

export default function HeroBanner() {
    return (
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#17351f] via-[#1f4d2e] to-[#7dbb43] px-5 py-3 text-white shadow-[0_10px_30px_rgba(16,40,23,0.2)]">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/15">
                    <FiFeather className="text-[18px]" />
                </div>

                <p className="min-w-0 flex-1 truncate text-sm">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#dff0d2]">
                        Selamat Datang di
                    </span>

                    <span className="ml-2 font-bold">Jamoe Djawa</span>

                    <span className="ml-2 hidden text-[#eef7e8] lg:inline">
                        — Warisan Leluhur Nusantara untuk kesehatan alami dan
                        edukasi herbal tradisional Indonesia.
                    </span>
                </p>
            </div>
        </div>
    );
}
