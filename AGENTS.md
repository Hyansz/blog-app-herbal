<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Catatan database
- `lib/prisma.ts` memakai `PrismaNeonHTTP` (adapter HTTP) yang **tidak mendukung transaksi**.
- Karena itu, **JANGAN** menggunakan `$transaction`, `nested write` (nested `create/connect/connectOrCreate`), `upsert`, `createMany`, `updateMany`, atau `create/update` yang langsung memakai `include`/`select` relasi.
- Solusi aman: tulis dulu tanpa `include`/`select` relasi → kemudian `findUnique` + `include` (baca ulang) untuk mendapatkan data relasi.
- `findMany` + `include` untuk read-only **aman**. Read tanpa relasi juga aman.
- Hindari `delete` cascade kompleks dalam satu operasi tulis; pastikan tidak ada operasi yang membutuhkan atomic multi-entitas.
