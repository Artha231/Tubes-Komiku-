
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Heart,
  Copy,
  ZoomIn,
  ChevronRight,
  X,
} from "lucide-react";
import pb from "@/lib/pocketbase";

type MangaRecord = {
  id: string;
  title?: string;
  cover?: string;
  type?: string;
  latestChapter?: number;
  rating?: number;
  description?: string;
  genre?: string[] | string;
  status?: string;
};

type ChapterRecord = {
  id: string;
  manga: string;
  chapterNumber?: number;
  title?: string;
  releaseDate?: string;
  pages?: string[];
};

function renderStars(rating: number) {
  const full = Math.max(0, Math.min(5, Math.round(rating / 2)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function formatDate(date?: string) {
  if (!date) return "Tanggal tidak tersedia";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white px-4 py-2 rounded-lg shadow-xl text-sm">
      {message}
    </div>
  );
}

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Tutup gambar"
        className="absolute top-4 right-4 text-white/70 hover:text-white"
      >
        <X size={28} />
      </button>

      {src ? (
        <Image
          src={src}
          alt={alt}
          width={500}
          height={700}
          unoptimized
          className="rounded-lg shadow-2xl max-h-[85vh] w-auto object-contain"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <p className="text-gray-300">Cover belum tersedia.</p>
      )}
    </div>
  );
}

export default function MangaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params.id);

  const [manga, setManga] = useState<MangaRecord | null>(null);
  const [chapters, setChapters] = useState<ChapterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [favoriteRecordId, setFavoriteRecordId] = useState<string | null>(
    null
  );
  const [favLoading, setFavLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [imgOpen, setImgOpen] = useState(false);
  const [allRead, setAllRead] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setLoadError("");

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
      } catch (error) {
        console.error("Gagal mengambil detail manga:", error);

        if (active) {
          setLoadError(
            "Data manga gagal dimuat. Periksa koneksi PocketBase dan aturan akses collection."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    async function loadFavorite() {
      setIsFav(false);
      setFavoriteRecordId(null);

      const userId = pb.authStore.record?.id;

      if (!pb.authStore.isValid || !userId) return;

      try {
        const records = await pb.collection("favorites").getFullList({
          filter: `user = "${userId}" && manga = "${id}"`,
        });

        if (!active) return;

        if (records.length > 0) {
          setIsFav(true);
          setFavoriteRecordId(records[0].id);
        }
      } catch (error) {
        console.error("Gagal memuat favorit:", error);
      }
    }

    void loadFavorite();

    return () => {
      active = false;
    };
  }, [id]);

  const flash = (message: string) => {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(null), 2200);
  };

  const toggleFav = async () => {
    if (!pb.authStore.isValid || !pb.authStore.record?.id) {
      router.push("/login");
      return;
    }

    if (favLoading) return;

    setFavLoading(true);

    try {
      if (isFav && favoriteRecordId) {
        await pb.collection("favorites").delete(favoriteRecordId);

        setIsFav(false);
        setFavoriteRecordId(null);
        flash("Dihapus dari Favorit.");
      } else {
        const created = await pb.collection("favorites").create({
          user: pb.authStore.record.id,
          manga: id,
        });

        setIsFav(true);
        setFavoriteRecordId(created.id);
        flash("Ditambahkan ke Favorit!");
      }
    } catch (error) {
      console.error("Gagal memperbarui favorit:", error);
      flash("Favorit gagal diperbarui. Periksa aturan akses favorites.");
    } finally {
      setFavLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Link disalin ke papan klip!");
    } catch {
      flash("Gagal menyalin link.");
    }
  };

  if (loading) {
    return (
      <p className="text-center py-12 text-gray-400">
        Memuat detail manga…
      </p>
    );
  }

  if (!manga) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-3">
        <p className="text-red-400">
          {loadError || "Manga tidak ditemukan."}
        </p>
        <Link href="/" className="text-blue-400 hover:underline">
          Kembali ke halaman utama
        </Link>
      </div>
    );
  }

  const title = manga.title || "Untitled";
  const cover = manga.cover ? pb.files.getURL(manga, manga.cover) : "";

  const genres = Array.isArray(manga.genre)
    ? manga.genre
    : typeof manga.genre === "string" && manga.genre
      ? [manga.genre]
      : [];

  const status = manga.status || "Unknown";
  const description =
    manga.description || "Belum ada deskripsi untuk manga ini.";

  const rating =
    typeof manga.rating === "number" ? manga.rating : undefined;

  const orderedChapters = [...chapters].sort(
    (a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <nav className="text-sm text-gray-400 flex items-center gap-1">
        <Link href="/" className="hover:underline hover:text-white">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-200">{title}</span>
      </nav>

      <section className="flex flex-col md:flex-row gap-8 items-start">
        <div
          className="relative cursor-pointer group flex-shrink-0 w-[200px] min-h-[250px]"
          onClick={() => setImgOpen(true)}
        >
          {cover ? (
            <Image
              src={cover}
              alt={title}
              width={250}
              height={350}
              unoptimized
              className="rounded-xl shadow-lg group-hover:brightness-90 transition w-full h-auto"
            />
          ) : (
            <div className="rounded-xl bg-gray-800 w-[200px] h-[280px] flex items-center justify-center text-gray-500 text-sm">
              Cover belum tersedia
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">{title}</h1>

          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="bg-blue-600/20 text-blue-400 rounded-full px-3 py-0.5 text-xs font-medium"
              >
                {genre}
              </span>
            ))}

            {manga.type && (
              <span className="bg-purple-600/20 text-purple-300 rounded-full px-3 py-0.5 text-xs font-medium">
                {manga.type}
              </span>
            )}

            <span className="bg-green-600/20 text-green-400 rounded-full px-3 py-0.5 text-xs font-medium">
              {status}
            </span>
          </div>

          {rating !== undefined && (
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-lg tracking-wider">
                {renderStars(rating)}
              </span>
              <span className="text-sm text-gray-300">
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {orderedChapters.length > 0 && (
              <Link
                href={`/manga/${id}/${orderedChapters[0].id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <BookOpen size={18} />
                Mulai Baca Chapter{" "}
                {orderedChapters[0].chapterNumber ?? 1}
              </Link>
            )}

            <button
              onClick={toggleFav}
              disabled={favLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60 ${
                isFav
                  ? "bg-rose-600 border-rose-600 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
              }`}
            >
              <Heart
                size={16}
                className={isFav ? "fill-white" : ""}
              />
              {favLoading
                ? "Memproses…"
                : isFav
                  ? "Favorit"
                  : "Tambah Favorit"}
            </button>

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

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            Daftar Chapter ({orderedChapters.length})
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

        {orderedChapters.length === 0 ? (
          <p className="text-sm text-gray-400 rounded-xl border border-gray-800 bg-gray-800/40 p-4">
            Belum ada chapter untuk manga ini.
          </p>
        ) : (
          <ul className="space-y-2">
            {orderedChapters.map((chapter) => (
              <li
                key={chapter.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <Link
                  href={`/manga/${id}/${chapter.id}`}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium"
                >
                  {chapter.title ||
                    `Chapter ${chapter.chapterNumber ?? "?"}`}
                </Link>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    {formatDate(chapter.releaseDate)}
                  </span>

                  <Link
                    href={`/manga/${id}/${chapter.id}`}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <BookOpen size={12} />
                    Baca
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ImageModal
        src={cover}
        alt={title}
        open={imgOpen}
        onClose={() => setImgOpen(false)}
      />

      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
