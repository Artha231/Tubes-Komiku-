"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useMangaDetail } from "@/hooks/useManga";
import {
  BookOpen,
  Heart,
  Copy,
  ZoomIn,
  ChevronRight,
  X,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Render ★/☆ from a 0‑10 rating scaled to 5 stars */
function renderStars(rating: number) {
  const full = Math.round(rating / 2);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/** Small auto‑dismiss toast */
function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white px-4 py-2 rounded-lg shadow-xl text-sm animate-pulse">
      {message}
    </div>
  );
}

/** Fullscreen image modal */
function ImageModal({
  src,
  alt,
  open,
  onClose,
}: {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white"
      >
        <X size={28} />
      </button>
      <Image
        src={src}
        alt={alt}
        width={500}
        height={700}
        className="rounded-lg shadow-2xl max-h-[85vh] object-contain"
      />
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function MangaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data, isLoading, isError } = useMangaDetail(id);

  // ── State ──────────────────────────────────────────────────────────────
  const [isFav, setIsFav] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [imgOpen, setImgOpen] = useState(false);
  const [allRead, setAllRead] = useState(false);

  // Load favourite from localStorage
  useEffect(() => {
    setIsFav(localStorage.getItem(`fav-manga-${id}`) === "true");
  }, [id]);

  // ── Guards ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return <p className="text-center py-12 text-gray-400">Loading…</p>;
  }
  if (isError || !data) {
    return notFound();
  }

  // ── Safe destructuring with defaults ───────────────────────────────────
  const {
    title = "Untitled",
    cover = "",
    genre = [],
    status = "Unknown",
    description = "",
    chapters = [],
    rating,
  } = data;

  // Make sure genre is always an array (extra guard)
  const safeGenre = Array.isArray(genre) ? genre : [];

  // ── Handlers ───────────────────────────────────────────────────────────
  const toggleFav = () => {
    const next = !isFav;
    setIsFav(next);
    localStorage.setItem(`fav-manga-${id}`, String(next));
    flash(next ? "Ditambahkan ke Favorit!" : "Dihapus dari Favorit.");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Link disalin ke papan klip!");
    } catch {
      flash("Gagal menyalin link.");
    }
  };

  const flash = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 flex items-center gap-1">
        <Link href="/" className="hover:underline hover:text-white">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-200">{title}</span>
      </nav>

      {/* ── Hero: Cover + Info ── */}
      <section className="flex flex-col md:flex-row gap-8 items-start">
        {/* Cover (click to zoom) */}
        <div
          className="relative cursor-pointer group flex-shrink-0"
          onClick={() => setImgOpen(true)}
        >
          <Image
            src={cover}
            alt={title}
            width={250}
            height={350}
            className="rounded-xl shadow-lg group-hover:brightness-90 transition"
          />
          <div className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Info panel */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">{title}</h1>

          {/* Genre badges + status */}
          <div className="flex flex-wrap gap-2">
            {safeGenre.map((g: string) => (
              <span
                key={g}
                className="bg-blue-600/20 text-blue-400 rounded-full px-3 py-0.5 text-xs font-medium"
              >
                {g}
              </span>
            ))}
            <span className="bg-green-600/20 text-green-400 rounded-full px-3 py-0.5 text-xs font-medium">
              {status}
            </span>
          </div>

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-lg tracking-wider">
                {renderStars(rating)}
              </span>
              <span className="text-sm text-gray-300">{rating.toFixed(1)}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 leading-relaxed">{description}</p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {/* Read chapter 1 */}
            {chapters.length > 0 && (
              <Link
                href={`/manga/${id}/${chapters[0].id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <BookOpen size={18} />
                Mulai Baca Chapter 1
              </Link>
            )}

            {/* Favorite */}
            <button
              onClick={toggleFav}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                isFav
                  ? "bg-rose-600 border-rose-600 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
              }`}
            >
              <Heart
                size={16}
                className={isFav ? "fill-white" : ""}
              />
              {isFav ? "Favorit" : "Tambah Favorit"}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
            >
              <Copy size={16} />
              Share
            </button>
          </div>
        </div>
      </section>

      {/* ── Chapter List ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            Daftar Chapter ({chapters.length})
          </h2>
          <button
            onClick={() => {
              setAllRead(true);
              flash("Semua chapter ditandai sudah dibaca!");
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Tandai Semua Dibaca
          </button>
        </div>

        {allRead && (
          <p className="text-xs text-green-400 mb-3">
            ✓ Semua chapter ditandai sudah dibaca!
          </p>
        )}

        <ul className="space-y-2">
          {chapters.map((ch) => (
            <li
              key={ch.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <Link
                href={`/manga/${id}/${ch.id}`}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium"
              >
                {ch.title}
              </Link>
              <div className="flex items-center gap-3">
                {/* release date – already a plain string, no hydration issue */}
                <span className="text-xs text-gray-500">{ch.release}</span>
                <Link
                  href={`/manga/${id}/${ch.id}`}
                  className="bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  <BookOpen size={12} />
                  Baca
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Zoom modal */}
      <ImageModal
        src={cover}
        alt={title}
        open={imgOpen}
        onClose={() => setImgOpen(false)}
      />

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
