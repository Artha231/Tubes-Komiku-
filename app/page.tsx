"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import {
  Bookmark,
  Search,
  ArrowUpDown,
  Flame,
  CheckCircle2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Manga", "Manhwa", "Light Novel"] as const;

// ─── Types ───────────────────────────────────────────────────────────────────
type Manga = {
  id: string;
  title: string;
  cover: string;
  type: string;
  latestChapter: number;
  updatedAt: string;
  rating: number;
  isPopular: boolean;
};

type FavoriteRecord = {
  id: string;
  user: string;
  manga: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTimeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  return `${Math.floor(hours / 24)} hari lalu`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loadingManga, setLoadingManga] = useState(true);
  const [errorManga, setErrorManga] = useState("");

  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [favoriteRecordIds, setFavoriteRecordIds] = useState<
    Record<string, string>
  >({});
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ── Fetch manga from PocketBase ──────────────────────────────────────────
  useEffect(() => {
    let active = true;

    async function fetchManga() {
      try {
        setLoadingManga(true);
        setErrorManga("");

        const records = await pb.collection("manga").getFullList({
          sort: "-updated",
        });

        const data: Manga[] = records.map((record) => ({
          id: record.id,
          title: record.title,
          cover: record.cover
            ? pb.files.getURL(record, record.cover)
            : "/images/simple.jpeg",
          type: record.type,
          latestChapter: record.latestChapter ?? 0,
          updatedAt: record.updated
            ? getTimeAgo(record.updated)
            : "Belum diperbarui",
          rating: record.rating ?? 0,
          isPopular: record.isPopular ?? false,
        }));

        if (active) setMangaList(data);
      } catch (error) {
        console.error("Gagal mengambil data manga:", error);
        if (active) {
          setErrorManga("Gagal mengambil data manga dari PocketBase.");
        }
      } finally {
        if (active) setLoadingManga(false);
      }
    }

    fetchManga();

    return () => {
      active = false;
    };
  }, []);

  // ── Fetch favorites for the logged-in user ───────────────────────────────
  useEffect(() => {
    let active = true;

    async function fetchFavorites() {
      setFavoritesLoading(true);

      if (!pb.authStore.isValid || !pb.authStore.record?.id) {
        if (active) {
          setBookmarks([]);
          setFavoriteRecordIds({});
          setFavoritesLoading(false);
        }
        return;
      }

      try {
        const userId = pb.authStore.record.id;

        const records = await pb.collection("favorites").getFullList({
          filter: `user = "${userId}"`,
        });

        if (!active) return;

        const ids: string[] = [];
        const recordMap: Record<string, string> = {};

        (records as FavoriteRecord[]).forEach((record) => {
          ids.push(record.manga);
          recordMap[record.manga] = record.id;
        });

        setBookmarks(ids);
        setFavoriteRecordIds(recordMap);
      } catch (error) {
        console.error("Gagal mengambil favorit:", error);
        if (active) {
          showToast("Gagal memuat favorit dari server.");
        }
      } finally {
        if (active) setFavoritesLoading(false);
      }
    }

    fetchFavorites();

    return () => {
      active = false;
    };
  }, []);

  // ── Toggle favorite in PocketBase ────────────────────────────────────────
  const toggleBookmark = async (id: string, title: string) => {
    if (!pb.authStore.isValid || !pb.authStore.record?.id) {
      showToast("Login terlebih dahulu untuk menyimpan favorit.");
      router.push("/login");
      return;
    }

    if (favoritesLoading) {
      showToast("Sedang memuat favorit, coba lagi sebentar.");
      return;
    }

    try {
      const favoriteId = favoriteRecordIds[id];

      if (favoriteId) {
        await pb.collection("favorites").delete(favoriteId);

        setBookmarks((prev) => prev.filter((item) => item !== id));

        setFavoriteRecordIds((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });

        showToast(`Dihapus dari Favorit: ${title}`);
      } else {
        const record = await pb.collection("favorites").create({
          user: pb.authStore.record.id,
          manga: id,
        });

        setBookmarks((prev) =>
          prev.includes(id) ? prev : [...prev, id]
        );

        setFavoriteRecordIds((prev) => ({
          ...prev,
          [id]: record.id,
        }));

        showToast(`Ditambahkan ke Favorit: ${title}`);
      }
    } catch (error) {
      console.error("Gagal mengubah favorit:", error);
      showToast("Gagal menyimpan favorit. Periksa koneksi dan API Rules.");
    }
  };

  // ── Filter + Search + Favorites ─────────────────────────────────────────
  let filteredManga = mangaList.filter((manga) => {
    const matchesType =
      selectedType === "All" || manga.type === selectedType;

    const matchesSearch = manga.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesBookmark = showBookmarksOnly
      ? bookmarks.includes(manga.id)
      : true;

    return matchesType && matchesSearch && matchesBookmark;
  });

  // ── Sorting ─────────────────────────────────────────────────────────────
  if (sortBy === "rating") {
    filteredManga = [...filteredManga].sort(
      (a, b) => b.rating - a.rating
    );
  } else if (sortBy === "chapter") {
    filteredManga = [...filteredManga].sort(
      (a, b) => b.latestChapter - a.latestChapter
    );
  } else if (sortBy === "title") {
    filteredManga = [...filteredManga].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  const popularManga = mangaList.filter((manga) => manga.isPopular);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section className="space-y-8 p-4 max-w-7xl mx-auto min-h-screen text-white">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-pulse">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Trending / Popular banner */}
      {!showBookmarksOnly && searchQuery === "" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <h2 className="text-lg font-bold">Trending &amp; Populer</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {popularManga.map((item) => (
              <Link
                key={item.id}
                href={`/manga/${item.id}`}
                className="min-w-[200px] w-[200px] bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all flex-shrink-0 group"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.cover}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <span className="absolute bottom-2 left-2 text-xs font-bold bg-orange-600/90 px-2 py-0.5 rounded text-white">
                    🔥 Populer
                  </span>
                </div>

                <div className="p-2.5">
                  <p className="font-semibold text-xs line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.type} • Ch. {item.latestChapter}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search, favorites and sorting */}
      <div className="space-y-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul komik..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-800/90 text-white rounded-xl border border-gray-700/60 focus:outline-none focus:border-blue-500 text-xs transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                if (!pb.authStore.isValid) {
                  showToast("Login terlebih dahulu untuk melihat favorit.");
                  router.push("/login");
                  return;
                }

                setShowBookmarksOnly((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showBookmarksOnly
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  showBookmarksOnly ? "fill-white" : ""
                }`}
              />
              <span>Favorit ({bookmarks.length})</span>
            </button>

            <div className="relative flex items-center bg-gray-800 border border-gray-700 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="default" className="bg-gray-900">
                  Urutkan: Default
                </option>
                <option value="rating" className="bg-gray-900">
                  Rating Tertinggi
                </option>
                <option value="chapter" className="bg-gray-900">
                  Chapter Terbaru
                </option>
                <option value="title" className="bg-gray-900">
                  Judul (A-Z)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Category buttons */}
        <div className="flex gap-2 overflow-x-auto pt-1 pb-1">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedType(category)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === category
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-700/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main manga grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {showBookmarksOnly ? "Komik Favorit Saya" : "Daftar Komik"}
          </h2>

          <span className="text-xs text-gray-400">
            Menampilkan {filteredManga.length} komik
          </span>
        </div>

        {loadingManga || favoritesLoading && showBookmarksOnly ? (
          <p className="py-12 text-center text-gray-400">
            Memuat data...
          </p>
        ) : errorManga ? (
          <p className="py-12 text-center text-red-400">{errorManga}</p>
        ) : filteredManga.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm">
              {showBookmarksOnly
                ? "Belum ada komik yang ditambahkan ke favorit."
                : "Komik yang kamu cari tidak ditemukan."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredManga.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-800/80"
              >
                {/* Cover image */}
                <Link
                  href={`/manga/${item.id}`}
                  className="block relative aspect-[3/4] overflow-hidden"
                >
                  <Image
                    src={item.cover}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {/* Rating badge */}
                <div className="absolute top-1.5 left-1.5 bg-black/70 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                  ⭐ {item.rating.toFixed(1)}
                </div>

                {/* Favorite button */}
                <button
                  onClick={() => void toggleBookmark(item.id, item.title)}
                  aria-label={
                    bookmarks.includes(item.id)
                      ? `Hapus ${item.title} dari favorit`
                      : `Tambahkan ${item.title} ke favorit`
                  }
                  className="absolute top-1.5 right-1.5 bg-black/50 p-1 rounded-full hover:bg-black/80 transition-colors"
                >
                  <Bookmark
                    size={14}
                    className={
                      bookmarks.includes(item.id)
                        ? "text-red-400 fill-red-400"
                        : "text-white/70"
                    }
                  />
                </button>

                {/* Chapter badge */}
                <div className="absolute bottom-[52px] right-1.5 bg-blue-600/90 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                  Ch. {item.latestChapter}
                </div>

                {/* Manga info */}
                <div className="p-2.5">
                  <h3
                    className="text-xs font-semibold text-white line-clamp-1"
                    title={item.title}
                  >
                    {item.title}
                  </h3>

                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.type} • {item.updatedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}