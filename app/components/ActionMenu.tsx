"use client";

import { createPortal } from "react-dom";
import { FiMoreHorizontal, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";

interface ActionMenuProps {
    onEdit: () => void;
    onDelete: () => void;
    disabled?: boolean;
    label?: string;
    size?: "md" | "sm";
}

const OPEN_EVENT = "actionmenu:open";
let menuSeq = 0;

export default function ActionMenu({
    onEdit,
    onDelete,
    disabled,
    label = "Opsi",
    size = "md",
}: ActionMenuProps) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const idRef = useRef<string>("");

    useEffect(() => {
        if (!idRef.current) {
            menuSeq += 1;
            idRef.current = `actionmenu-${menuSeq}`;
        }
    }, []);

    // Hanya satu menu terbuka pada satu waktu
    useEffect(() => {
        if (!open) return;

        function onOpen(e: Event) {
            const detail = (e as CustomEvent<string>).detail;
            if (detail !== idRef.current) setOpen(false);
        }

        window.addEventListener(OPEN_EVENT, onOpen as EventListener);
        return () => window.removeEventListener(OPEN_EVENT, onOpen as EventListener);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        function place() {
            const btn = triggerRef.current;
            const menu = menuRef.current;
            if (!btn || !menu) return;

            const r = btn.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Tutup jika pemicu keluar dari viewport (mis. saat scroll)
            if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) {
                setOpen(false);
                return;
            }

            const mh = menu.offsetHeight;
            const mw = menu.offsetWidth;
            const gap = 4;
            const openUp = r.bottom + gap + mh > vh && r.top - gap - mh >= 0;
            const top = openUp ? r.top - gap - mh : r.bottom + gap;

            // Rata kanan terhadap pemicu, dijepit agar tidak keluar layar
            let right = vw - r.right;
            if (right + mw > vw - 8) right = 8;
            if (right < 8) right = 8;

            setPos({ top, right });
        }

        place();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        document.addEventListener("mousedown", onDocDown);
        document.addEventListener("keydown", onEsc);

        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
            document.removeEventListener("mousedown", onDocDown);
            document.removeEventListener("keydown", onEsc);
        };

        function onEsc(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault();
                close(true);
            }
        }

        function onDocDown(e: MouseEvent) {
            const t = e.target as Node;
            if (triggerRef.current?.contains(t)) return;
            if (menuRef.current?.contains(t)) return;
            setOpen(false);
        }
    }, [open]);

    function openMenu() {
        if (disabled) return;
        window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: idRef.current }));
        setOpen(true);
    }

    function toggle() {
        if (disabled) return;
        if (open) setOpen(false);
        else openMenu();
    }

    function close(refocus = false) {
        setOpen(false);
        if (refocus) triggerRef.current?.focus();
    }

    function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) openMenu();
            else menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
        } else if (e.key === "ArrowUp" && open) {
            e.preventDefault();
            const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
            if (items && items.length > 0) items[items.length - 1].focus();
        }
    }

    function handleMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
        if (!items || items.length === 0) return;

        const list = Array.from(items);
        const active = document.activeElement as HTMLButtonElement | null;
        let idx = active ? list.indexOf(active) : -1;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            idx = (idx + 1) % list.length;
            list[idx].focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            idx = (idx - 1 + list.length) % list.length;
            list[idx].focus();
        } else if (e.key === "Tab") {
            e.preventDefault();
            close(true);
        } else if (e.key === "Escape") {
            e.preventDefault();
            close(true);
        }
    }

    const triggerSize =
        size === "sm" ? "min-h-9 min-w-9" : "min-h-10 min-w-10";

    const trigger = (
        <button
            ref={triggerRef}
            type="button"
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={open}
            disabled={disabled}
            onClick={toggle}
            onKeyDown={handleTriggerKeyDown}
            className={`inline-flex ${triggerSize} items-center justify-center rounded-xl border border-[#dce6dc] bg-white text-[#17351f] shadow-sm transition hover:border-[#7dbb43] hover:bg-[#f7faf4] focus:outline-none focus:ring-2 focus:ring-[#7dbb43]/30 ${
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
        >
            <FiMoreHorizontal aria-hidden />
        </button>
    );

    if (!open) return <span className="inline-flex">{trigger}</span>;

    const menu = (
        <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
            style={{
                position: "fixed",
                top: pos ? `${pos.top}px` : "-9999px",
                right: pos ? `${pos.right}px` : "-9999px",
                zIndex: 1000,
            }}
            className="min-w-[9rem] rounded-xl border border-[#dce6dc] bg-white shadow-md"
        >
            <div className="flex flex-col p-1">
                <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                        onEdit();
                        close(true);
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#17351f] transition hover:bg-[#f5f9f3] focus:outline-none focus:ring-2 focus:ring-[#7dbb43]/30"
                >
                    <FiEdit2 aria-hidden />
                    <span>Edit</span>
                </button>

                <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                        onDelete();
                        close(true);
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400/30"
                >
                    <FiTrash2 aria-hidden />
                    <span>Hapus</span>
                </button>
            </div>
        </div>
    );

    return (
        <span className="inline-flex">
            {trigger}
            {typeof document !== "undefined" ? createPortal(menu, document.body) : menu}
        </span>
    );
}
