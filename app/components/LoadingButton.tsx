import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;

    loadingText?: string;

    spinnerClassName?: string;

    children?: ReactNode;
}

export default function LoadingButton({
    loading = false,

    loadingText = "",

    spinnerClassName = "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",

    disabled,

    children,

    ...rest
}: Props) {
    return (
        <button
            {...rest}

            disabled={disabled || loading}
        >
            {loading ? (
                <>
                    <span
                        aria-hidden="true"
                        className={spinnerClassName}
                    />

                    {loadingText}
                </>
            ) : (
                children
            )}
        </button>
    );
}