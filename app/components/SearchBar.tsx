type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Cari herbal nusantara..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-2xl border border-[#dce6dc] bg-[#f8faf6] px-5 py-4 pr-14 text-[#1d2b1f] shadow-sm outline-none transition-all duration-300 focus:border-[#4d8b5e] focus:bg-white focus:ring-4 focus:ring-[#dff0d2]"
                />

                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7dbb43]">
                    ⌕
                </div>
            </div>

            <button className="rounded-2xl bg-gradient-to-r from-[#1f4d2e] to-[#2f6b3f] px-6 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                Cari
            </button>
        </div>
    );
}
