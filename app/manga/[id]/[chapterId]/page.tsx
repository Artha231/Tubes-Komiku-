
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import pb from "@/lib/pocketbase";

type MangaRecord = {
  id: string;
  title?: string;
};

type ChapterRecord = {
  id: string;
  manga: string;
  chapterNumber?: number;
  title?: string;
  pages?: string[];
};

export default function ChapterReaderPage() {
  const params = useParams<{ id: string; chapterId: string }>();
  const id = String(params.id);
  const chapterId = String(params.chapterId);

  const [manga, setManga] = useState<MangaRecord | null>(null);
  const [chapters, setChapters] = useState<ChapterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReaderData() {
      setLoading(true);
      setError("");

      try {
        const [mangaRecord, chapterRecords] = await Promise.all([
          pb.collection("manga").getOne<MangaRecord>(id),
          pb.collection("chapters").getFullList<ChapterRecord>({
            filter: `manga = "${id}"`,
            sort: "chapterNumber",
          }),
        ]);

        if (!active) return;

        setManga(mangaRecord);
        setChapters(chapterRecords);
      } catch (err) {
        console.error("Gagal memuat chapter:", err);

        if (active) {
          setError(
            "Data chapter gagal dimuat. Periksa koneksi PocketBase dan aturan akses collection."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReaderData();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <p className="text-center py-12 text-gray-400">
        Memuat chapter…
      </p>
    );
  }

  if (!manga) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4 text-center">
        <p className="text-red-400">
          {error || "Manga tidak ditemukan."}
        </p>

        <Link
          href={`/manga/${id}`}
          className="inline-flex items-center gap-2 text-blue-400 hover:underline"
        >
          <ArrowLeft size={16} />
          Kembali ke detail
        </Link>
      </div>
    );
  }

  const orderedChapters = [...chapters].sort(
    (a, b) =>
      (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0)
  );

  const currentIdx = orderedChapters.findIndex(
    (chapter) => chapter.id === chapterId
  );

  if (currentIdx === -1) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-3">
        <p className="text-gray-300">
          Chapter ini tidak ditemukan pada manga tersebut.
        </p>

        <Link
          href={`/manga/${id}`}
          className="text-blue-400 hover:underline"
        >
          Kembali ke detail manga
        </Link>
      </div>
    );
  }

  const chapter = orderedChapters[currentIdx];

  const prevChapter =
    currentIdx > 0 ? orderedChapters[currentIdx - 1] : null;

  const nextChapter =
    currentIdx < orderedChapters.length - 1
      ? orderedChapters[currentIdx + 1]
      : null;

  const pageFiles = Array.isArray(chapter.pages)
    ? chapter.pages
    : [];

  const pages = pageFiles.map((fileName) => ({
    src: pb.files.getURL(chapter, fileName),
    alt: `${
      chapter.title ||
      `Chapter ${chapter.chapterNumber ?? "?"}`
    } – halaman`,
  }));

  const chapterLabel =
    chapter.title ||
    `Chapter ${chapter.chapterNumber ?? "?"}`;

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const NavBar = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/80 backdrop-blur-md p-3 rounded-xl border border-gray-800">
      <Link
        href={`/manga/${id}`}
        className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Detail
      </Link>

      <div className="flex items-center gap-2">
        {prevChapter ? (
          <Link
            href={`/manga/${id}/${prevChapter.id}`}
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <ChevronLeft size={14} />
            Prev
          </Link>
        ) : (
          <span className="flex items-center gap-1 bg-gray-800/50 text-gray-600 px-3 py-1.5 rounded-lg text-xs cursor-not-allowed">
            <ChevronLeft size={14} />
            Prev
          </span>
        )}

        <span className="text-xs text-gray-400 px-2 min-w-[80px] text-center">
          {currentIdx + 1} / {orderedChapters.length}
        </span>

        {nextChapter ? (
          <Link
            href={`/manga/${id}/${nextChapter.id}`}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            Next
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span className="flex items-center gap-1 bg-gray-800/50 text-gray-600 px-3 py-1.5 rounded-lg text-xs cursor-not-allowed">
            Next
            <ChevronRight size={14} />
          </span>
        )}
      </div>

      <select
        value={chapterId}
        aria-label="Pilih chapter"
        onChange={(event) => {
          window.location.href = `/manga/${id}/${event.target.value}`;
        }}
        className="bg-gray-800 text-xs text-gray-200 rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none cursor-pointer"
      >
        {orderedChapters.map((item) => (
          <option
            key={item.id}
            value={item.id}
            className="bg-gray-900"
          >
            {item.title ||
              `Chapter ${item.chapterNumber ?? "?"}`}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold">
          {manga.title || "Untitled"}
        </h1>

        <h2 className="text-sm text-gray-400">
          {chapterLabel}
        </h2>
      </div>

      <NavBar />

      <div className="space-y-1 flex flex-col items-center">
        {pages.length > 0 ? (
          pages.map((page, index) => (
            <div
              key={`${chapter.id}-${page.src}`}
              className="relative w-full max-w-2xl bg-gray-900 rounded-lg overflow-hidden border border-gray-800"
            >
              <img
                src={page.src}
                alt={`${page.alt} ${index + 1}`}
                className="w-full h-auto object-contain mx-auto"
                loading={index === 0 ? "eager" : "lazy"}
              />

              <div className="absolute bottom-2 right-2 bg-black/60 text-gray-300 text-[10px] px-2 py-0.5 rounded">
                {index + 1} / {pages.length}
              </div>
            </div>
          ))
        ) : (
          <div className="w-full max-w-2xl rounded-xl border border-gray-800 bg-gray-900/70 p-8 text-center space-y-2">
            <p className="text-lg font-semibold text-gray-200">
              Gambar chapter belum tersedia
            </p>

            <p className="text-sm text-gray-400">
              Chapter ini sudah terdaftar, tetapi field{" "}
              <code>pages</code> masih kosong. Unggah gambar
              halaman di record chapter melalui dashboard
              PocketBase.
            </p>
          </div>
        )}
      </div>

      <NavBar />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}