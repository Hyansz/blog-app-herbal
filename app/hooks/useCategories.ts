"use client";

import { useCallback, useEffect, useState } from "react";

export interface CategoryMenuItem {
    id: string;

    name: string;

    slug: string;
}

export const CATEGORIES_UPDATED_EVENT = "categories-updated";

const REFRESH_INTERVAL = 30_000;

/**
 * Sumber data kategori untuk Sidebar.
 *
 * - Memakai initialData dari server component sebagai render pertama.
 * - Refetch saat tab kembali fokus / terlihat kembali.
 * - Polling tiap 30 detik hanya selama tab terlihat.
 * - Refetch langsung ketika ada mutasi (event CATEGORIES_UPDATED_EVENT).
 */
export function useCategories(initialData?: CategoryMenuItem[]) {
    const [categories, setCategories] = useState<CategoryMenuItem[]>(
        initialData ?? [],
    );

    const [lastInitialData, setLastInitialData] =
        useState(initialData);

    const refetch = useCallback(async () => {
        try {
            const res = await fetch("/api/categories", {
                cache: "no-store",
            });

            if (!res.ok) return;

            const data = await res.json();

            if (Array.isArray(data)) {
                setCategories(data);
            }
        } catch {
            /* diamkan, retry di interval berikutnya */
        }
    }, []);

    /* initialData baru dari server component (mis. setelah router.refresh),
       ditulis saat render agar tidak setState di dalam effect. */
    if (initialData && initialData !== lastInitialData) {
        setLastInitialData(initialData);

        setCategories(initialData);
    }

    useEffect(() => {
        const handleVisible = () => {
            if (document.visibilityState === "visible") {
                refetch();
            }
        };

        const handleUpdated = () => {
            refetch();
        };

        document.addEventListener("visibilitychange", handleVisible);

        window.addEventListener("focus", handleVisible);

        window.addEventListener(CATEGORIES_UPDATED_EVENT, handleUpdated);

        let timer: ReturnType<typeof setInterval> | null = null;

        const startPolling = () => {
            if (timer !== null) return;

            timer = setInterval(refetch, REFRESH_INTERVAL);
        };

        const stopPolling = () => {
            if (timer === null) return;

            clearInterval(timer);

            timer = null;
        };

        const syncPolling = () => {
            if (document.visibilityState === "visible") {
                startPolling();
            } else {
                stopPolling();
            }
        };

        syncPolling();

        document.addEventListener("visibilitychange", syncPolling);

        return () => {
            document.removeEventListener("visibilitychange", handleVisible);

            document.removeEventListener("visibilitychange", syncPolling);

            window.removeEventListener("focus", handleVisible);

            window.removeEventListener(
                CATEGORIES_UPDATED_EVENT,
                handleUpdated,
            );

            stopPolling();
        };
    }, [refetch]);

    return { categories, refetch };
}