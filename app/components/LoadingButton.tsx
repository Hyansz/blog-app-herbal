"use client";

import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingText?: string | null; // teks pengganti; "" = spinner saja; null = spinner + isi tombol tetap
    spinnerClassName?: string;
};

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg
            className={`animate-spin ${className}`}
            style={{ display: "inline-block", flexShrink: 0, verticalAlign: "middle" }}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}

export default function LoadingButton({
    loading = false,
    loadingText,
    spinnerClassName,
    disabled,
    children,
    ...rest
}: Props) {
    let content = children;

    if (loading && loadingText === null) {
        content = (
            <>
                <Spinner className={spinnerClassName} />
                {children}
            </>
        );
    } else if (loading) {
        const text = loadingText === undefined ? children : loadingText;
        const hasText = text !== "" && text != null && text !== false;
        content = hasText ? (
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    whiteSpace: "nowrap",
                }}
            >
                <Spinner className={spinnerClassName} />
                <span>{text}</span>
            </span>
        ) : (
            <Spinner className={spinnerClassName} />
        );
    }

    return (
        <button {...rest} disabled={disabled || loading} aria-busy={loading}>
            {content}
        </button>
    );
}