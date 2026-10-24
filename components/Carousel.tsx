"use client";

import { useRef } from "react";
import { useManga } from "@/hooks/useManga";
import { dummyManga } from "@/data/dummyManga";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontal carousel showing manga cards.
 * Uses CSS scroll-snap and arrow buttons for navigation.
 */
export default function Carousel({ type }: { type: "latest" | "popular" }) {
  const { data, isLoading } = useManga();

  // Filter items based on type
  const allItems = data ?? dummyManga;
  const items =
    type === "popular"
      ? allItems.filter((m) => m.isPopular)
      : allItems;

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newPos =
      dir === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
    scrollRef.current.scrollTo({ left: newPos, behavior: "smooth" });
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">
        {type === "popular" ? "Komik Populer" : "Trending Terbaru"}
      </h2>
      {isLoading ? (
        <p className="text-center py-8 text-gray-400">Loading...</p>
      ) : (
        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/90 z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/90 z-10"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x scrollbar-hide"
          >
            {items.map((manga) => (
              <div
                key={manga.id}
                className="snap-start min-w-[150px] max-w-[150px] flex-shrink-0"
              >
                <a
                  href={`/manga/${manga.id}`}
                  className="block group"
                >
                  <div className="bg-gray-800 rounded overflow-hidden shadow hover:shadow-lg transition">
                    <div className="relative h-48 w-full bg-gray-700">
                      <img
                        src={manga.cover}
                        alt={manga.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2">
                      <h3
                        className="text-sm font-medium truncate text-white"
                        title={manga.title}
                      >
                        {manga.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {manga.type || "Manga"}
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
