"use client";

import { useEffect, useRef, useState } from "react";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image as TiptapImage } from "@tiptap/extension-image";

import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    RemoveFormatting,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo2,
} from "lucide-react";

interface Props {
    value: string;
    onChange: (html: string) => void;
}

/* Tombol toolbar. type="button" wajib supaya tidak ikut
   men-submit form induk. */
function ToolbarButton({
    label,
    active = false,
    disabled = false,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            /* Cegah editor kehilangan fokus saat tombol diklik. */
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={
                active
                    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7dbb43] text-white"
                    : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#4d8b5e] transition hover:bg-[#eef6ec] hover:text-[#1f4d2e]"
            }
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <span className="mx-1 h-6 w-px bg-[#dce6dc]" />;
}

export default function RichTextEditor({ value, onChange }: Props) {
    const [uploading, setUploading] = useState(false);

    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const editor = useEditor({
        /* Wajib false di Next App Router agar tidak ada
           mismatch hydration. */
        immediatelyRender: false,

        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
                link: {
                    openOnClick: false,
                    autolink: true,
                    linkOnPaste: true,
                    protocols: ["http", "https", "mailto"],
                    HTMLAttributes: {
                        rel: "noopener noreferrer",
                        target: "_blank",
                    },
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right"],
            }),
            TiptapImage.configure({
                allowBase64: false,
            }),
            Placeholder.configure({
                placeholder: "Tulis isi artikel lengkap...",
            }),
        ],

        content: value || "",

        editorProps: {
            attributes: {
                class: "min-h-72 sm:min-h-96 p-4 text-base leading-relaxed text-[#425445] outline-none",
            },
        },

        onUpdate: ({ editor: current }) => {
            onChangeRef.current(current.getHTML());
        },
    });

    /* Sinkronkan bila value berubah dari luar (mis. data hasil fetch). */
    useEffect(() => {
        if (!editor) return;

        const current = editor.getHTML();

        if (value === current) return;
        if (!value && (current === "<p></p>" || current === "")) return;

        editor.commands.setContent(value || "", { emitUpdate: false });
    }, [editor, value]);

    const active = useEditorState({
        editor,
        selector: ({ editor: current }) =>
            current
                ? {
                      bold: current.isActive("bold"),
                      italic: current.isActive("italic"),
                      underline: current.isActive("underline"),
                      strike: current.isActive("strike"),
                      h2: current.isActive("heading", { level: 2 }),
                      h3: current.isActive("heading", { level: 3 }),
                      bulletList: current.isActive("bulletList"),
                      orderedList: current.isActive("orderedList"),
                      blockquote: current.isActive("blockquote"),
                      link: current.isActive("link"),
                      left: current.isActive({ textAlign: "left" }),
                      center: current.isActive({ textAlign: "center" }),
                      right: current.isActive({ textAlign: "right" }),
                      canUndo: current.can().chain().undo().run(),
                      canRedo: current.can().chain().redo().run(),
                  }
                : null,
    });

    function handleLink() {
        if (!editor) return;

        if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        const previous = (editor.getAttributes("link").href as string) || "";

        const url = window.prompt("URL:", previous || "https://");

        if (url === null) return;

        if (url.trim() === "") {
            editor.chain().focus().unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({
            href: url.trim(),
        }).run();
    }

    function handleInsertImage() {
        if (!editor || uploading) return;

        const input = document.createElement("input");

        input.type = "file";
        input.accept = "image/*";

        input.onchange = async () => {
            const file = input.files?.[0];

            if (!file) return;

            setUploading(true);

            try {
                const formData = new FormData();

                formData.append("file", file);

                /* /api/upload sudah ADMIN-only. */
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();

                if (data.url) {
                    editor
                        .chain()
                        .focus()
                        .setImage({ src: data.url, alt: "" })
                        .run();
                } else {
                    alert(data.message || "Upload gagal");
                }
            } catch {
                alert("Upload gagal");
            } finally {
                setUploading(false);
            }
        };

        input.click();
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-[#dce6dc] bg-white focus-within:border-[#7dbb43]">
            {/* SCROLL CONTAINER */}
            <div className="max-h-[70vh] overflow-y-auto">
                {/* TOOLBAR */}
                <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[#dce6dc] bg-[#f9fbf8] px-2 py-2 sm:px-3">
                <ToolbarButton
                    label="Tebal"
                    active={active?.bold}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().toggleBold().run()
                    }
                >
                    <Bold size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Miring"
                    active={active?.italic}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                    }
                >
                    <Italic size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Garis bawah"
                    active={active?.underline}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().toggleUnderline().run()
                    }
                >
                    <UnderlineIcon size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Coret"
                    active={active?.strike}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().toggleStrike().run()
                    }
                >
                    <Strikethrough size={17} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                    label="Judul 2"
                    active={active?.h2}
                    disabled={!editor}
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                    }
                >
                    <Heading2 size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Judul 3"
                    active={active?.h3}
                    disabled={!editor}
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                    }
                >
                    <Heading3 size={17} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                    label="Daftar bullet"
                    active={active?.bulletList}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                    }
                >
                    <List size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Daftar bernomor"
                    active={active?.orderedList}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                    }
                >
                    <ListOrdered size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Kutipan"
                    active={active?.blockquote}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().toggleBlockquote().run()
                    }
                >
                    <Quote size={17} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                    label="Rata kiri"
                    active={active?.left}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().setTextAlign("left").run()
                    }
                >
                    <AlignLeft size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Rata tengah"
                    active={active?.center}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().setTextAlign("center").run()
                    }
                >
                    <AlignCenter size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Rata kanan"
                    active={active?.right}
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().setTextAlign("right").run()
                    }
                >
                    <AlignRight size={17} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                    label="Tautan"
                    active={active?.link}
                    disabled={!editor}
                    onClick={handleLink}
                >
                    <Link2 size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Garis pemisah"
                    disabled={!editor}
                    onClick={() =>
                        editor?.chain().focus().setHorizontalRule().run()
                    }
                >
                    <Minus size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Sisipkan gambar"
                    disabled={!editor || uploading}
                    onClick={handleInsertImage}
                >
                    <ImageIcon size={17} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                    label="Bersihkan format"
                    disabled={!editor}
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .unsetAllMarks()
                            .clearNodes()
                            .run()
                    }
                >
                    <RemoveFormatting size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Urungkan"
                    disabled={!active?.canUndo}
                    onClick={() => editor?.chain().focus().undo().run()}
                >
                    <Undo2 size={17} />
                </ToolbarButton>

                <ToolbarButton
                    label="Ulangi"
                    disabled={!active?.canRedo}
                    onClick={() => editor?.chain().focus().redo().run()}
                >
                    <Redo2 size={17} />
                </ToolbarButton>
            </div>

                {/* AREA TULIS */}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
