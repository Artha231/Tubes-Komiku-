import { dummyManga } from "@/data/dummyManga";

// ─── Types ───────────────────────────────────────────────────────────────────
export type MangaItem = {
  id: number;
  title: string;
  cover: string;
  type: string;
  latestChapter: number;
  updatedAt: string;
  rating: number;
  isPopular: boolean;
};

export type Chapter = {
  id: number;
  title: string;
  release: string; // pre-formatted string, NOT a Date – avoids hydration mismatch
};

export type MangaDetail = MangaItem & {
  description: string;
  genre: string[];
  status: string;
  chapters: Chapter[];
};

// ─── useManga ────────────────────────────────────────────────────────────────
// Returns the full dummy manga list (used on the homepage).
export function useManga() {
  return {
    data: dummyManga as MangaItem[],
    isLoading: false,
    isError: false,
  };
}

// ─── useMangaDetail ──────────────────────────────────────────────────────────
// Returns enriched detail for a single manga by ID.
// Falls back gracefully so consuming components never crash.
export function useMangaDetail(id: string | number) {
  const item = dummyManga.find((m) => String(m.id) === String(id));

  if (!item) {
    return {
      data: null as MangaDetail | null,
      isLoading: false,
      isError: true,
    };
  }

  const detailData: MangaDetail = {
    ...item,
    description:
      "Ini adalah deskripsi cerita lengkap untuk " +
      item.title +
      ". Mengisahkan tentang perjalanan mendalam, pertempuran sengit, dan petualangan yang tak terlupakan.",
    genre: ["Action", "Adventure", item.type, "Fantasy"],
    status: "Ongoing",
    // Tanggal sudah berupa string agar SSR & Client identik (no hydration mismatch)
    chapters: [
      { id: 1, title: "Chapter 1: Awal Perjalanan", release: "10 Jan 2024" },
      { id: 2, title: "Chapter 2: Tantangan Baru", release: "17 Jan 2024" },
      { id: 3, title: "Chapter 3: Kekuatan Tersembunyi", release: "24 Jan 2024" },
      { id: 4, title: "Chapter 4: Batas Kemampuan", release: "31 Jan 2024" },
      { id: 5, title: "Chapter 5: Pertempuran Terakhir", release: "7 Feb 2024" },
    ],
  };

  return {
    data: detailData,
    isLoading: false,
    isError: false,
  };
}
