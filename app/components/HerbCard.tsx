import Link from "next/link";
import Image from "next/image";

interface Props {
    herb: {
        name: string;
        description: string;
        slug: string;
        image: string;

        category?: {
            name: string;
        };
    };
}

export default function HerbCard({ herb }: Props) {
    return (
        <Link href={`/herbal/${herb.slug}`} prefetch>
            <article className="group overflow-hidden rounded-[32px] border border-[#dce6dc] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-[#7dbb43] hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                {/* IMAGE */}
                <div className="relative h-60 overflow-hidden bg-[#eef2ea]">
                    <Image
                        src={herb.image}
                        alt={herb.name}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-110"
                    />

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {/* CATEGORY BADGE */}
                    {herb.category && (
                        <div className="absolute left-4 top-4">
                            <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#1f4d2e] shadow-md backdrop-blur">
                                {herb.category.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div className="p-6">
                    {/* TITLE */}
                    <h2 className="line-clamp-2 text-2xl font-black leading-snug text-[#1f4d2e] transition-colors duration-300 group-hover:text-[#2f6b3f]">
                        {herb.name}
                    </h2>

                    {/* DESCRIPTION */}
                    <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-[#5f6f61]">
                        {herb.description}
                    </p>

                    {/* BUTTON */}
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#7dbb43]">
                            Baca Selengkapnya
                        </span>

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef6ec] text-[#2f6b3f] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#dff0d2]">
                            →
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
