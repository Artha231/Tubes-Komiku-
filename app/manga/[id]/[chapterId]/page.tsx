"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMangaDetail } from "@/hooks/useManga";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ChapterReaderPage({
  params,
}: {
  params: { id: string; chapterId: string };
}) {
  const { id, chapterId } = params;
  const { data, isLoading, isError } = useMangaDetail(id);

  const [showScrollTop, setShowScrollTop] = useState(false);

  // ── Loading / error guards ─────────────────────────────────────────────
  if (isLoading) {
    return <p className="text-center py-12 text-gray-400">Loading…</p>;
  }
  if (isError || !data) {
    return notFound();
  }

  const manga = data;
  const chapters = manga.chapters ?? [];

  // If no chapters exist at all, show friendly fallback
  if (chapters.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4 text-center">
        <h1 className="text-2xl font-bold">{manga.title}</h1>
        <p className="text-gray-400">
          Tidak ada data chapter untuk manga ini.
        </p>
        <Link
          href={`/manga/${id}`}
          className="inline-flex items-center gap-2 text-blue-400 hover:underline"
        >
          <ArrowLeft size={16} /> Kembali ke detail
        </Link>
      </div>
    );
  }

  // Find current chapter
  const currentIdx = chapters.findIndex(
    (ch) => String(ch.id) === String(chapterId)
  );
  if (currentIdx === -1) return notFound();

  const chapter = chapters[currentIdx];
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextChapter =
    currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  // Generate placeholder pages (since we don't have real page images)
  const pages = Array.from({ length: 5 }, (_, i) => ({
    src: `https://via.placeholder.com/800x1100/1a1a2e/ffffff?text=${encodeURIComponent(
      `${manga.title}\n${chapter.title}\nHalaman ${i + 1}`
    )}`,
    alt: `${chapter.title} – Halaman ${i + 1}`,
  }));

  // Scroll listener for "back to top" button
  if (typeof window !== "undefined") {
    window.onscroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── Navigation Bar (reusable for top & bottom) ─────────────────────────
  const NavBar = () => (
    <div className="flex items-center justify-between gap-3 bg-gray-900/80 backdrop-blur-md p-3 rounded-xl border border-gray-800">
      {/* Back to detail */}
      <Link
        href={`/manga/${id}`}
        className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Detail
      </Link>

      {/* Prev / Chapter info / Next */}
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
          Ch. {chapterId} / {chapters.length}
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

      {/* Chapter select dropdown */}
      <select
        value={chapterId}
        onChange={(e) => {
          window.location.href = `/manga/${id}/${e.target.value}`;
        }}
        className="bg-gray-800 text-xs text-gray-200 rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none cursor-pointer"
      >
        {chapters.map((ch) => (
          <option key={ch.id} value={ch.id} className="bg-gray-900">
            {ch.title}
          </option>
        ))}
      </select>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold">{manga.title}</h1>
        <h2 className="text-sm text-gray-400">{chapter.title}</h2>
      </div>

      {/* Top Navigation */}
      <NavBar />

      {/* ── Comic Pages ── */}
      <div className="space-y-1 flex flex-col items-center">
        {pages.map((page, idx) => (
          <div
            key={idx}
            className="relative w-full max-w-2xl bg-gray-900 rounded-lg overflow-hidden border border-gray-800"
          >
            <img
              src={page.src}
              alt={page.alt}
              className="w-full h-auto object-contain mx-auto"
              loading="lazy"
            />
            {/* Page number badge */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-gray-300 text-[10px] px-2 py-0.5 rounded">
              {idx + 1} / {pages.length}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <NavBar />

      {/* Scroll to top FAB */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}
