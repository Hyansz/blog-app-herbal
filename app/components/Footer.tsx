export default function Footer() {
    return (
        <footer className="border-t border-[#dce6dc] bg-white/80 backdrop-blur-md">
            <div className="px-8 py-7">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div>
                        <h3 className="text-lg font-bold tracking-wide text-[#1f4d2e]">
                            Jamoe Djawa
                        </h3>

                        <p className="mt-1 text-sm text-[#5f6f61]">
                            Website edukasi herbal nusantara.
                        </p>
                    </div>

                    <p className="text-sm font-medium text-[#8b6b2e]">
                        © 2026 Raihan Regita Harjuno
                    </p>
                </div>
            </div>
        </footer>
    );
}
