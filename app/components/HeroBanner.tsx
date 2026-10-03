interface Props {
    eyebrow: string;

    title: string;

    subtitle: string;
}

export default function HeroBanner({ eyebrow, title, subtitle }: Props) {
    return (
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#31543d] bg-gradient-to-br from-[#17351f] via-[#1f4d2e] to-[#7dbb43] p-6 text-white shadow-[0_20px_60px_rgba(16,40,23,0.25)] lg:p-8">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dff0d2]/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#dff0d2] sm:text-sm">
                    {eyebrow}
                </p>

                <h1 className="text-3xl font-black leading-tight lg:text-4xl">
                    {title}
                </h1>

                <p className="mt-3 text-base leading-relaxed text-[#eef7e8]">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
