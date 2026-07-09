"use client";

import { FiSearch } from "react-icons/fi";

type Props = {
    value?: string;
    onChange?: (value: string) => void;
};

export default function SearchBar({
    value = "",
    onChange,
}: Props) {
    return (
        <div className="flex items-center gap-4">
            {/* INPUT */}
            <div className="group relative flex-1">
                {/* GLOW */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-[#7dbb43]/20 to-[#4d8b5e]/20 opacity-0 blur-xl transition-all duration-500 group-focus-within:opacity-100" />

                <input
                    type="text"
                    placeholder="Cari herbal nusantara..."
                    value={value}
                    onChange={(e) =>
                        onChange?.(e.target.value)
                    }
                    className="relative w-full rounded-[28px] border border-[#dce6dc] bg-white px-6 py-4 pr-16 text-[15px] font-medium text-[#1d2b1f] shadow-[0_8px_30px_rgba(16,40,23,0.06)] outline-none transition-all duration-300 placeholder:text-[#8ca08f] focus:border-[#7dbb43] focus:shadow-[0_15px_40px_rgba(125,187,67,0.18)]"
                />

                {/* SEARCH ICON */}
                <div className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef7e8] to-[#dff0d2] shadow-inner">
                    <FiSearch className="text-[22px] text-[#2f6b3f]" />
                </div>
            </div>

            {/* BUTTON */}
            <button className="group relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#1f4d2e] via-[#2f6b3f] to-[#4d8b5e] px-7 py-4 font-semibold tracking-wide text-white shadow-[0_15px_35px_rgba(31,77,46,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(31,77,46,0.38)] active:scale-[0.98]">
                <div className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100">
                    <div className="absolute -left-10 top-0 h-full w-16 rotate-12 bg-white/20 blur-xl" />
                </div>

                <span className="relative z-10 flex items-center gap-2">
                    <FiSearch className="text-[20px]" />
                    Cari
                </span>
            </button>
        </div>
    );
}