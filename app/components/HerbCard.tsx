import Link from "next/link";

interface Props {
    herb: {
        name: string;
        slug: string;
        image: string;
    };
}

export default function HerbCard({ herb }: Props) {
    return (
        <Link href={`/herbal/${herb.slug}`}>
            <div className="group overflow-hidden rounded-[32px] border border-[#dce6dc] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-[#7dbb43] hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                <div className="relative h-56 overflow-hidden bg-[#eef2ea]">
                    <img
                        src={herb.image}
                        alt={herb.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                <div className="p-6">
                    <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#7dbb43]">
                        Herbal Nusantara
                    </p>

                    <h2 className="text-center text-2xl font-bold text-[#1f4d2e]">
                        {herb.name}
                    </h2>
                </div>
            </div>
        </Link>
    );
}
