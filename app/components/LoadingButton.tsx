import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;

    /**
     * Teks yang ditampilkan saat loading.
     * - string  : spinner + teks (label children disembunyikan)
     * - ""      : spinner saja (untuk tombol ikon)
     * - null    : spinner + children tetap tampil (untuk tombol berikon/count)
     */
    loadingText?: string | null;

    children?: ReactNode;
}

export default function LoadingButton({
    loading = false,

    loadingText = "Memuat...",
    disabled,

    className = "",

    children,

    ...rest
}: Props) {
    return (
        <button
            {...rest}

            type={rest.type ?? "button"}

            disabled={disabled || loading}

            aria-busy={loading || undefined}

            data-loading={loading || undefined}

            className={className}
        >
            {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                    <span
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
                    />

                    {loadingText === null ? children : loadingText}
                </span>
            ) : (
                children
            )}
        </button>
    );
}
